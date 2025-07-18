# backend/app/utils/coursera_searcher.py

import requests
import json
import time
from typing import List, Dict, Any
from urllib.parse import quote
import logging
from bs4 import BeautifulSoup
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CourseraSearcher:
    def __init__(self):
        """
        Initialize the Coursera searcher using web scraping.
        """
        self.session = requests.Session()
        
        # Set headers to mimic a real browser
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                          'AppleWebKit/537.36 (KHTML, like Gecko) '
                          'Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;'
                      'q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })

    def search_courses_web(self, skill: str, level: str = None) -> List[Dict[str, Any]]:
        """
        Search courses using web scraping from Coursera search results.
        """
        # Construct search URL
        search_url = (
            f"https://www.coursera.org/search?query={quote(skill)}"
            "&index=prod_all_launched_products_term_optimization"
        )
        
        # Add level filter if specified
        if level:
            level_mapping = {
                'beginner': 'Beginner',
                'intermediate': 'Intermediate',
                'advanced': 'Advanced'
            }
            level_param = level_mapping.get(level.lower(), level)
            search_url += f"&productDifficultyLevel={level_param}"
        
        try:
            logger.info(f"Searching: {search_url}")
            response = self.session.get(search_url, timeout=10)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract course data from search results
            courses: List[Dict[str, Any]] = []
            
            # Look for course cards in the search results
            course_cards = soup.find_all('div', {'data-testid': 'search-result-card'})
            
            if not course_cards:
                # Try alternative selectors
                course_cards = soup.find_all(
                    'div', class_=re.compile(r'.*result.*card.*')
                )
            
            if not course_cards:
                # Fallback: find direct links to /learn/
                course_links = soup.find_all('a', href=re.compile(r'/learn/'))
                for link in course_links[:10]:
                    href = link.get('href', '')
                    if '/learn/' in href:
                        course_url = (
                            f"https://www.coursera.org{href}"
                            if href.startswith('/') else href
                        )
                        title = link.get_text(strip=True)
                        if title:
                            courses.append({
                                'title': title,
                                'url': course_url,
                                'description': '',
                                'level': level or 'Unknown',
                                'rating': 0,
                                'duration': '',
                                'skills': [skill]
                            })
            else:
                # Parse the top 10 cards
                for card in course_cards[:10]:
                    try:
                        # Title
                        title_elem = card.find('h3') or card.find('h2') or card.find('a')
                        title = title_elem.get_text(strip=True) if title_elem else ''
                        
                        # URL
                        link_elem = card.find('a', href=re.compile(r'/learn/'))
                        url = ''
                        if link_elem:
                            href = link_elem.get('href', '')
                            url = (
                                f"https://www.coursera.org{href}"
                                if href.startswith('/') else href
                            )
                        
                        # Description
                        desc_elem = card.find('p') or card.find(
                            'div', class_=re.compile(r'.*description.*')
                        )
                        description = desc_elem.get_text(strip=True) if desc_elem else ''
                        
                        # Rating
                        rating = 0.0
                        rating_elem = card.find('span', class_=re.compile(r'.*rating.*'))
                        if rating_elem:
                            rt = rating_elem.get_text(strip=True)
                            m = re.search(r'(\d+\.?\d*)', rt)
                            if m:
                                rating = float(m.group(1))
                        
                        if title and url:
                            courses.append({
                                'title': title,
                                'url': url,
                                'description': description,
                                'level': level or 'Unknown',
                                'rating': rating,
                                'duration': '',
                                'skills': [skill]
                            })
                    except Exception as e:
                        logger.warning(f"Error parsing course card: {e}")
                        continue
            
            return courses[:3]  # top 3
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed for {skill} ({level}): {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error for {skill} ({level}): {e}")
            return []

    def get_courses_for_skill(self, skill: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get courses for a specific skill across all difficulty levels.
        """
        levels = ['beginner', 'intermediate', 'advanced']
        skill_courses: Dict[str, List[Dict[str, Any]]] = {}
        
        for level in levels:
            logger.info(f"Searching for {level} courses for skill: {skill}")
            courses = self.search_courses_web(skill, level)
            if not courses:
                logger.warning(f"No courses found for {skill} ({level})")
            skill_courses[level] = courses
            time.sleep(2)  # polite delay
        
        return skill_courses

    def search_multiple_skills(self, skills: List[str]) -> Dict[str, Dict[str, List[Dict[str, Any]]]]:
        """
        Search for courses across multiple skills.
        """
        all_results: Dict[str, Dict[str, List[Dict[str, Any]]]] = {}
        
        for skill in skills:
            logger.info(f"Processing skill: {skill}")
            all_results[skill] = self.get_courses_for_skill(skill)
            time.sleep(3)
        
        return all_results

    def save_to_json(self, data: Dict[str, Any], filename: str = "coursera_courses.json"):
        """
        Save the results to a JSON file.
        """
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            logger.info(f"Results saved to {filename}")
        except Exception as e:
            logger.error(f"Failed to save results: {e}")
