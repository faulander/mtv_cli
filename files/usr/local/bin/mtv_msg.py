#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# --------------------------------------------------------------------------
# Mediathekview auf der Kommandozeile
#
# Logging auf Basis von loguru
#
# Author: Bernhard Bablok
# License: GPL3
#
# Website: https://github.com/bablokb/mtv_cli
#
# --------------------------------------------------------------------------

import sys
from loguru import logger

# Standardkonfiguration entfernen
logger.remove()

# Eigenes Format (ähnlich zum bisherigen)
logger.add(
    sys.stderr,
    format="[{level}] [{time:YYYY-MM-DD HH:mm:ss}] {message}",
    level="TRACE",
)

# Log-Level-Mapping (bisherige Namen auf loguru-Namen)
_LEVEL_MAP = {
    "TRACE": "TRACE",
    "DEBUG": "DEBUG",
    "INFO":  "INFO",
    "WARN":  "WARNING",
    "ERROR": "ERROR",
}

def set_level(level_name):
    """Log-Level setzen. Entfernt den bisherigen Handler und
       fügt einen neuen mit dem gewünschten Level hinzu."""
    logger.remove()
    loguru_level = _LEVEL_MAP.get(level_name, level_name)
    logger.add(
        sys.stderr,
        format="[{level}] [{time:YYYY-MM-DD HH:mm:ss}] {message}",
        level=loguru_level,
    )

class Msg:
    """Kompatibilitätsklasse — leitet Aufrufe an loguru weiter"""

    level = "INFO"

    @staticmethod
    def msg(msg_level, text, nl=True):
        """Ausgabe einer Meldung"""
        if not nl:
            # Fortschrittsanzeige ohne Zeilenumbruch (wie bisher direkt auf stderr)
            sys.stderr.write(text)
            sys.stderr.flush()
            return

        loguru_level = _LEVEL_MAP.get(msg_level, msg_level)
        logger.log(loguru_level, text)
