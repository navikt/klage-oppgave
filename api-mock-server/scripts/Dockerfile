FROM ruby:latest

WORKDIR /usr/app/
COPY . .

RUN bundle install -j 8

CMD ["ruby"]

