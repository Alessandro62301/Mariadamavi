FROM nginx:alpine

COPY mavi-landing.html /usr/share/nginx/html/index.html
COPY faq.html /usr/share/nginx/html/faq.html
COPY public /usr/share/nginx/html/public

EXPOSE 80
