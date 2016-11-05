
/**
 * request.js
 *
 * Request class contains server only options
 */

import { format as format_url, parse as parse_url } from 'url';
import Headers from './headers.js';
import Body, { clone } from './body';

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
export default class Request extends Body {
	constructor(input, init = {}) {
		let parsedURL;

		// normalize input
		if (!(input instanceof Request)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(encodeURI(input.href));
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(encodeURI(input + ''));
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		super(init.body || clone(input), {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		// fetch spec options
		this.method = init.method || input.method || 'GET';
		this.redirect = init.redirect || input.redirect || 'follow';
		this.headers = new Headers(init.headers || input.headers || {});

		// server only options
		this.follow = init.follow !== undefined ?
			init.follow : input.follow !== undefined ?
			input.follow : 20;
		this.compress = init.compress !== undefined ?
			init.compress : input.compress !== undefined ?
			input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;

		// server request options
		Object.assign(this, parsedURL);
	}

	get url() {
		return format_url(this);
	}

	/**
	 * Clone this request
	 *
	 * @return  Request
	 */
	clone() {
		return new Request(this);
	}

	/**
	 * Tag used by `Object.prototype.toString()`.
	 */
	get [Symbol.toStringTag]() {
		return 'Request';
	}
}
