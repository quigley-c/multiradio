#!/bin/bash
# Retrieves some mpd info in JSON format.
# To configure mpc as it is used in this script set the environment variables MPD_HOST and MPD_PORT.

output=$(mpc -f "%title%\n%file%\n%artist%\n%album%" current)
IFS=$'\n'

output_arr=($output)

title="${output_arr[0]}"
art=$(dirname "${output_arr[1]}")/cover.png
blur=$(dirname "${output_arr[1]}")/cover_blur.png
artist="${output_arr[2]}"
album="${output_arr[3]}"

if [ ! -n "$title" ]; then
	title=""
	art="default_fg.png"
	blur="default.png"
	artist=""
	album=""
fi

printf "{\"title\":\"$title\",\"art\":\"$art\",\"album\":\"$album\",\"artist\":\"$artist\",\"blur\":\"$blur\"}"
