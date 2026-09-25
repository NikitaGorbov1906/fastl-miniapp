# Fast-L Mini App

Статическая страничка Telegram Mini App для повторения карточек с телефона.

Здесь **нет** ни данных, ни исходников приложения Fast-L: карточки приходят от вашего бота в момент открытия (в адресе кнопки `/app`), оценки возвращаются боту через `Telegram.WebApp.sendData`. Страница кэшируется service worker'ом и работает без сети.

Источник файлов — папка `app/miniapp/` в приватном репозитории Fast-L; сюда они копируются скриптом `scripts/deploy-miniapp.sh`.

GitHub Pages: https://nikitagorbov19.github.io/fastl-miniapp/
