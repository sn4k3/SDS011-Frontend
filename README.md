# SDS011-Frontend
SDS011 Frontend made for Octoprint: https://github.com/sn4k3/Octoprint-SDS011

Adapted from: https://opensource.com/article/18/3/how-measure-particulate-matter-raspberry-pi

## 1. Instalation

First steps
 ```ssh
 sudo apt install git-core python-serial python-enum lighttpd
 sudo chown pi:pi /var/www/html/
 git clone https://github.com/sn4k3/Octoprint-SDS011.git /var/www/html 
 echo [] > /var/www/html/aqi.json
 chmod +x /var/www/html/aqi.py
 ```
 
 Run the script automatically so that we don’t have to start the script manually every time, we can let it start with a cronjob, e.g., with every restart of the Raspberry Pi. To do this, open the crontab file:
 
 ``crontab -e``
 
 and add the following line at the end:
 
 ``@reboot python /var/www/html/aqi.py &``
 
 Now we must confirure the http server, open the configuration file with:
 
 ``sudo nano /etc/lighttpd/lighttpd.conf``
 
 Then edit "server.port", i use 81, but you can choose.
 
 ``server.port                 = 81``
 
 Save, exit and reboot.
 
 ``sudo reboot``
 
 Now it must display the page, go to your web browser and test, eg:
 
 ```
 http://octopi.local:81
 OR
 http://IP:81
 ```
 
 ## 2. Configuration
 
 There are small things that you can adjust:
 
 **/var/www/html/aqi.py**
 
 Note: Changes under this file require a reboot or kill the process and re run. 
 
````python
READINGS = 10               # Number of readings, this will not perform an AVG, only the last read will be used as value
SLEEP_SECONDS = 60          # Update frequency in seconds
````

**/var/www/html/index.html**

````html
<!-- Page refresh frequency in seconds, remove line or comment for manual refresh -->
<meta http-equiv="refresh" content="20">
````