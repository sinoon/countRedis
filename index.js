var redis = require( 'redis' );

exports.createClient = function ( port, host, auth, prefix ) {
    switch ( arguments.length ) {
        case 0 :
            exports.redisClient = redis.createClient( 6379, '127.0.0.1' );
            exports.prefix = 'Ranaly:';
            break;
        case 1 :
            if ( typeof port === 'object' ) {
                exports.redisClient = port;
            } else {
                exports.redisClient = redis.createClient( port, '127.0.0.1' );
            }
            exports.prefix = 'Ranaly:';
            break;
        case 2 :
            if ( typeof port === 'object' ) {
                exports.redisClient = port;
                prefix = host;
            } else {
                exports.redisClient = redis.createClient( port, host );
                exports.prefix = 'Ranaly:';
            }
            break;
        case 3 :
            exports.redisClient = function () {
                redis.createClient( port, host );

                redis.auth( auth, function ( err ) {
                    if ( err ) {
                        console.log( 'Error:on auth!', err );
                    }
                    return redis;
                } )
            };
            exports.prefix = 'Ranaly:';
            break;
        case 4 :
            exports.redisClient = function () {
                redis.createClient( port, host );

                redis.auth( auth, function ( err ) {
                    if ( err ) {
                        console.log( 'Error:on auth!', err );
                    }
                    return redis;
                } )
            };
            exports.prefix = 'Ranaly:';
            break;
        default :
            throw new Error('Arguments is Wrong ! Please Check You Arguments Fellow Doc');
    }

    return {
        Amount : require( './type/amount' )( exports ),
        Realtime : require( './type/realtime' )( exports ),
        DataList : require( './type/data_list' )( exports )
    };
};

