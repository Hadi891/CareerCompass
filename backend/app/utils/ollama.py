# backend/app/utils/ollama.py

import subprocess
import logging

logger = logging.getLogger(__name__)

def chat_with_deepseek(prompt: str) -> str:
    """
    Call `ollama run deepseek-coder`, piping the prompt on stdin and
    capturing both stdout and stderr explicitly.
    """
    cmd = ["ollama", "run", "deepseek-coder"]
    logger.info("→ ollama cmd: %r (prompt length %d)", cmd, len(prompt))

    proc = subprocess.run(
        cmd,
        input=prompt,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )

    # If Ollama errored, log and raise
    if proc.returncode != 0:
        logger.error("Ollama stderr: %s", proc.stderr.strip())
        raise RuntimeError(f"Ollama chat failed: {proc.stderr.strip()!r}")

    # Make absolutely sure stdout is a string
    out = proc.stdout or ""
    out = out.strip()
    logger.info("← ollama stdout: %r", out)
    return out
