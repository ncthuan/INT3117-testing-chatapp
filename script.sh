#!/bin/bash
echo $ENV_NAME
if [ "$ENV_NAME" = "production" ]; then
    echo "Production"
    node dist/main.js
else
    # Check to rebuild node_modules if package.json has changed
    INSTALL_TMP_FILE=last_install.info
    if test -f "$INSTALL_TMP_FILE"; then
        echo "$FILE exists."
        LAST_INSTALL=`date -r $INSTALL_TMP_FILE +%s`
        LAST_PACKGE_MODI=`date -r package.json +%s`
        if [ "$LAST_PACKGE_MODI" -gt "$LAST_INSTALL" ]; then
          npm install --prefer-offline --no-audit
          touch $INSTALL_TMP_FILE
        fi
    else
      npm install --prefer-offline --no-audit
      touch $INSTALL_TMP_FILE
    fi
    echo "Development"
    npm run start
fi
