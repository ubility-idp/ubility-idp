#!/bin/bash
#uwsgi --ini robot.ini
set -m


#service nginx start &
/usr/sbin/nginx -g 'daemon off;' &
pm2 start /app/app.py  --name automation --interpreter python3 &
sed -i -e 's/#host_key_checking\ =\ False/host_key_checking\ =\ False/g' /etc/ansible/ansible.cfg

service ssh start &
export C_FORCE_ROOT=true
celery -A app.celery worker --pool=gevent -l debug -f celery.logs -n scripting  --concurrency=50 -E --detach
#/usr/sbin/nginx -g 'daemon off;'
fg %1


