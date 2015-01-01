from __future__ import unicode_literals, division, absolute_import
import logging
import re
from urlparse import urljoin

from requests import RequestException

from flexget import plugin
from flexget.entry import Entry
from flexget.event import event
from flexget.utils.cached_input import cached
from flexget.utils.trakt import API_URL, get_session, make_list_slug

log = logging.getLogger('trakt_list')


field_maps = {
    'movie': {
        'title': lambda i: '%s (%s)' % (i['movie']['title'], i['movie']['year']),
        'movie_name': 'movie.title',
        'movie_year': 'movie.year',
        'imdb_id': 'movie.ids.imdb',
        'tmdb_id': 'movie.ids.tmdb',
        'trakt_id': 'movie.ids.trakt',
        'trakt_slug': 'show.ids.slug'
    },
    'show': {
        'title': 'show.title',
        # TODO: Should this have series_name? We normally only have that for episodes
        'imdb_id': 'show.ids.imdb',
        'tvdb_id': 'show.ids.tvdb',
        'tvrage_id': 'show.ids.tvrage',
        'tmdb_id': 'show.ids.tmdb',
        'trakt_id': 'show.ids.trakt',
        'trakt_slug': 'show.ids.slug'
    },
    'episode': {
        'title': lambda i: '%s S%02dE%02d %s' % (i['show']['title'], i['episode']['season'],
                                                 i['episode']['number'], i['episode']['title']),
        'series_name': 'show.title',
        'series_season': 'episode.season',
        'series_episode': 'episode.number',
        'series_id': lambda i: 'S%02dE%02d' % (i['episode']['season'], i['episode']['number']),
        'imdb_id': 'episode.ids.imdb',
        'tvdb_id': 'episode.ids.tvdb',
        'tvrage_id': 'episode.ids.tvrage',
        'trakt_id': 'show.ids.trakt',
        'trakt_slug': 'show.ids.slug'
    }
}


class TraktList(object):
    """Creates an entry for each item in your trakt list.

    Syntax:

    trakt_list:
      username: <value>
      password: <value>
      type: <shows|movies|episodes>
      list: <collection|watchlist|watched|custom list name>
      strip_dates: <yes|no>

    Options username, type and list are required. password is required for private lists.
    """

    schema = {
        'type': 'object',
        'properties': {
            'username': {'type': 'string'},
            'password': {'type': 'string'},
            'type': {'type': 'string', 'enum': ['shows', 'movies', 'episodes']},
            'list': {'type': 'string'},
            'strip_dates': {'type': 'boolean', 'default': False}
        },
        'required': ['username', 'type', 'list'],
        'additionalProperties': False,
        'not': {
            'properties': {
                'type': {'enum': ['episodes']},
                'list': {'enum': ['collection', 'watched']}
            }
        },
        'error_not': '`collection` and `watched` lists do not support `episodes` type'
    }

    @cached('trakt_list', persist='2 hours')
    def on_task_input(self, task, config):
        session = get_session(config['username'], config.get('password'))
        url = urljoin(API_URL, 'users/%s/' % config['username'])
        if config['list'] in ['collection', 'watchlist', 'watched']:
            url = urljoin(url, '%s/%s' % (config['list'], (config['type'])))
        else:
            url = urljoin(url, 'lists/%s/items' % make_list_slug(config['list']))

        log.verbose('Retrieving `%s` list `%s`' % (config['type'], config['list']))
        try:
            result = session.get(url)
        except RequestException as e:
            raise plugin.PluginError('Could not retrieve list from trakt (%s)' % e.args[0])
        try:
            data = result.json()
        except ValueError:
            log.debug('Could not decode json from response: %s', result.text)
            raise plugin.PluginError('Error getting list from trakt.')
        if not data:
            log.warning('No data returned from trakt for %s list %s.' % (config['type'], config['list']))
            return

        entries = []
        list_type = (config['type']).rstrip('s')
        for item in data:
            if item['type'] not in field_maps:
                log.debug('Unknown type %s' % item['type'])
                continue
            if item['type'] != list_type:
                log.debug('Skipping %s because it is not a %s' % (item[item['type']]['title'], list_type))
                continue
            entry = Entry()
            if item['type'] == 'episode':
                entry['url'] = 'http://trakt.tv/shows/%s/seasons/%s/episodes/%s' % (
                    item['show']['ids']['slug'], item['episode']['season'], item['episode']['number'])
            else:
                entry['url'] = 'http://trakt.tv/%s/%s' % (item['type'], item[item['type']]['ids'].get('slug'))
            entry.update_using_map(field_maps[item['type']], item)
            if entry.isvalid():
                if config.get('strip_dates'):
                    # Remove year from end of name if present
                    entry['title'] = re.sub(r'\s+\(\d{4}\)$', '', entry['title'])
                entries.append(entry)
            else:
                log.debug('Invalid entry created? %s' % entry)

        return entries


@event('plugin.register')
def register_plugin():
    plugin.register(TraktList, 'trakt_list', api_ver=2)
