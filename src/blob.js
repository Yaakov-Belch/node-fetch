// based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js
// (MIT licensed)

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');
const CLOSED = Symbol('closed');

export default class Blob {
	constructor() {
		this[CLOSED] = false;
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = new Buffer(new Uint8Array(element.buffer, element.byteOffset, element.byteLength));
				} else if (element instanceof ArrayBuffer) {
					buffer = new Buffer(new Uint8Array(element));
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = new Buffer(typeof element === 'string' ? element : String(element));
				}
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[CLOSED] ? 0 : this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	get isClosed() {
		return this[CLOSED];
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(
			relativeStart,
			relativeStart + span
		);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		blob[CLOSED] = this[CLOSED];
		return blob;
	}
	close() {
		this[CLOSED] = true;
	}
	get [Symbol.toStringTag]() {
		return 'Blob';
	}
}
