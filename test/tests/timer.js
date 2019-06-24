'use strict';

const assert = require('assert' );

const time_ms = () => (new Date()).getTime();

const Timer = require('../../lib/timer');

describe('- timer', function()
{
	it('should dispatch timers', function( done )
	{
		global.LIQD_FLOW = undefined;

		let timers_cnt = 0, timer = new Timer();

		let start = time_ms();

		function dispatch( i )
		{
			let now = time_ms();

			assert.ok( start + i < now + 25 && start + i > now - 25 );

			if( --timers_cnt === 0 )
			{
				setTimeout( done, 200 );
			}

			assert.ok( timers_cnt >= 0 );
		}

		for( let i = 0; i < 1000; i += 10 )
		{
			++timers_cnt;
			assert.ok( timer.set( i, dispatch, i, i ) === i );
			assert.ok( timer.set( i, dispatch, i, i ) === i );
		}
	});

	it('should dispatch timers in reverse order', function( done )
	{
		let timers_cnt = 0, timer = new Timer();

		let start = time_ms();

		function dispatch( i )
		{
			let now = time_ms();

			assert.ok( start + i < now + 25 && start + i > now - 25 );

			if( --timers_cnt === 0 )
			{
				setTimeout( done, 200 );
			}

			assert.ok( timers_cnt >= 0 );
		}

		for( let i = 1000; i > 0; i -= 10 )
		{
			++timers_cnt;
			assert.ok( timer.set( i, dispatch, i, i ) === i );
			assert.ok( timer.set( i, dispatch, i, i ) === i );
		}
	});

	it('should clear timers', function( done )
	{
		let timers_cnt = 0, timer = new Timer();

		let start = time_ms();

		function dispatch( i )
		{
			assert.ok( false );

			assert.ok( timers_cnt >= 0 );
		}

		for( let i = 0; i < 1000; i += 10 )
		{
			++timers_cnt;
			assert.ok( timer.set( i, dispatch, i, i + 100 ) === i );
			assert.ok( timer.set( i, dispatch, i, i + 100 ) === i );
		}

		for( let i = 0; i < 500; i += 10 )
		{
			timer.clear( i );
		}

		for( let i = 990; i >= 500; i -= 10 )
		{
			timer.clear( i );
		}

		timer.clear( 'not_present' );

		setTimeout( done, 1200 );
	});

	it('should postpone timer', function( done )
	{
		let timers = [], timers_cnt = 0, timer = new Timer();

		let start = time_ms();

		function dispatch( i )
		{
			let now = time_ms();

			assert.ok( start + 300 + 3 * i < now + 25 && start + 300 + 3 * i > now - 25 );

			if( --timers_cnt === 0 )
			{
				setTimeout( done, 200 );
			}

			assert.ok( timers_cnt >= 0 );
		}

		for( let i = 0; i < 100; ++i )
		{
			++timers_cnt;
			if( Math.random() < 0.5 )
			{
				timers.push( timer.set( Timer.id(), dispatch, 100 + i, i ) );
			}
			else
			{
				timers.push( timer.set( dispatch, 100 + i, i ) );
			}

			assert.ok( timer.postpone( timers[i], 500 + 3 * i ) === true );
		}

		for( let i = 0; i < timers.length; ++i )
		{
			assert.ok( timer.postpone( timers[i], 300 + 3 * i ) === true );
		}

		assert.ok( timer.postpone( 'not_present', 500 ) === false );
	});

	it('should register global timer', function( done )
	{
		assert.ok( Timer.global('GlobalTimer') === true );
		assert.ok( Timer.global('GlobalTimer') === false );

		let start = time_ms();

		GlobalTimer.set( () =>
		{
			let now = time_ms();

			assert.ok( start + 250 < now + 25 && start + 250 > now - 25 );

			done();
		},
		250 );
	});
});
