#!/usr/bin/python3
# coding=utf-8
import cgi
import subprocess
import sys

SCRIPT_PATH = "/var/www/html/scripts/aqi3.py"
DATA_FILE = "/var/www/html/assets/aqi.json"
KILL_PROCESS = "ps aux | grep " + SCRIPT_PATH + " | grep -v \"grep\" | awk '{print $2}' | xargs kill -9 > /dev/null 2>&1 &"
START_PROCESS = "/usr/bin/python3 " + SCRIPT_PATH + " start > /dev/null 2>&1 &"
STOP_PROCESS = "/usr/bin/python3 " + SCRIPT_PATH + " stop > /dev/null 2>&1 &"


def killProcess():
    subprocess.check_output(KILL_PROCESS, shell=True, timeout=5)


def stopSensor():
    killProcess()
    subprocess.check_output(STOP_PROCESS, shell=True, timeout=5)


def restartProcess():
    killProcess()
    subprocess.check_output(START_PROCESS, shell=True, timeout=5)


def main():
    arguments = cgi.FieldStorage()
    for key in arguments.keys():
        value = arguments[key].value
        if key == 'action':
            if value == 'stop':
                stopSensor()
                print("ok")
                return
            elif value == 'start' or value == 'restart':
                restartProcess()
                print("ok")
                return
            elif value == 'resetdata':
                try:
                    with open(DATA_FILE, 'w') as outfile:
                        outfile.write('[]')
                except:
                    print("Unexpected error:", sys.exc_info())

                print("ok")
                return

    print("?")


main()
