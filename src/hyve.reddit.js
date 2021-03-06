(function(root) {

    var hyve = (typeof require == 'function') ? require('../src/hyve.core.js') : root.hyve

    hyve.feeds['reddit'] = {
        methods : ['search', 'popular'],
        interval : 5000,
        feed_urls : { // sort types: relevance, top, new
            search: 'http://www.reddit.com/search.json?q={{query}}&sort=relevance{{#&jsonp=#callback}}{{before}}',
            popular: 'http://www.reddit.com/search.json?q={{query}}&sort=top{{#&jsonp=#callback}}{{before}}'
        },
        format_url : function(query){
            var before_arg = ''
            if (this.before){
                before_arg = '&before='+this.before
            }
            return { query: query,
                     before: before_arg,
                   }
        },
        parse : function(data,query,callback){
            if (data.data.children[0]){
                this.before = data.data.children[0].data.name
                data.data.children.forEach(function(item){
                    var weight = 1
                    if (item.data.score){
                        weight = item.data.score
                    }
                    if (item.data.ups){
                        weight = weight + item.data.ups
                    }
                    if (item.data.num_comments){
                        weight = weight + item.data.num_comments
                    }
                    if (item.data.likes){
                        weight = weight + item.data.likes
                    }
                    links = []
                    if (item.data.url.search(/reddit.com/i) == -1){
                        links = [item.data.url]
                    }
                    hyve.process({
                        'service' : 'reddit',
                        'type' : 'link',
                        'query' : query,
                        'user' : {
                            'name' : item.data.author,
                            'avatar' : ''
                        },
                        'id' : item.data.id,
                        'date' : item.data.created_utc,
                        'text' : item.data.title,
                        'links'  : links,
                        'source' : item.data.url,
                        'thumbnail': item.data.thumbnail,
                        'weight' : weight
                    },callback)
                })
                if (hyve.method == 'popular') {
                    hyve.stop(['reddit'])
                }
            }
        }
    }

})(this)
