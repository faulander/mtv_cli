FROM debian:12-slim

# Abhängigkeiten installieren
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
      python3 wget curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# uv installieren
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Benutzer und Verzeichnisse anlegen
RUN useradd -m mtv && \
    mkdir -p /data/db /downloads && \
    chown mtv /data/db /downloads && \
    ln -s /data/db /home/mtv/.mediathek3

# Python-Abhängigkeiten mit uv installieren
COPY pyproject.toml /app/
RUN cd /app && uv pip install --system -r pyproject.toml

# Anwendungsdateien installieren
COPY files/usr/local/bin/ /usr/local/bin/
COPY files/usr/local/lib/ /usr/local/lib/
RUN chmod 755 /usr/local/bin/mtv_cli.py /usr/local/bin/mtv_web.py

# Einstiegsskripte installieren
COPY docker/ /
RUN chmod 755 /entrypoint /update-download-loop && \
    touch /etc/mtv_cli.conf && chown mtv /etc/mtv_cli.conf

VOLUME /data
VOLUME /downloads
EXPOSE 8026

USER mtv
CMD ["/entrypoint"]
