#!/usr/bin/env bash

ccc=$(date "+%S")

(( ccc >= 30 )) && {
   echo "doneeeeeeeeeeeeeeeeeeee"
} || {
   echo "not doneeeeeeeeeeeeeeeeeeeeeeee $ccc"
}
