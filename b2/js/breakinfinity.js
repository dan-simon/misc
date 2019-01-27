;(function (globalScope) {
	'use strict';
	/*
		# logarithmica_numerus_lite.js
		My "lite" attempt to store large numbers that only uses logarithms to convert.
		The full version will release later with negative numbers support.
		This library uses Decimal which is expressed as 10^(logarithm). There is only a factor:
		- Logarithm: The logarithm of the number.

		This version is way faster and less broken than IkerStreamer's logmath.js!
		You can find his code by clicking the link: https://github.com/Ikerstreamer/RGB-Idle/blob/master/logmath.js

		It is also almost 2x faster than break_infinity.js!
		If you want to use accuracy instead of performance, please use this library from the link: https://github.com/Patashu/break_infinity.js/blob/master/break_infinity.min.js
	*/
	class Decimal {
		static fromValue(value) {
			if (value==null) {
				return {logarithm:Number.NEGATIVE_INFINITY}
			} else if (value.logarithm!=undefined) {
				return value
			} else if (typeof(value)=='string') {
				var findE=value.search('e')
				if (findE==-1) {
					value=parseFloat(value)
					return {logarithm:Math.log10(value)}
				}
				var split=[value.slice(0,findE),value.slice(findE+1,value.length)]
				split[1]=parseFloat(split[1])
				if (split[0]=='') return {logarithm:split[1]}
				split[0]=parseFloat(split[0])
				return {logarithm:Math.log10(split[0])+split[1]}
			} else if (typeof(value)=='number') {
				return {logarithm:Math.log10(value)}
			} else {
				return {logarithm:Number.NEGATIVE_INFINITY}
			}
		}

		constructor(value) {
			var value=Decimal.fromValue(value)
			this.logarithm=value.logarithm
		}

		static fromNumber(value) {
			var valueTemp=new Decimal()
			valueTemp.logarithm=Math.log10(value)
			return valueTemp
		}

		fromNumber() {
			return Decimal.fromNumber(this)
		}

		static fromString(value) {
			var valueTemp=new Decimal()
			var findE=value.search('e')
			if (findE==-1) {
				value=parseFloat(value)
				return {logarithm:Math.log10(value)}
			}
			var split=[value.slice(0,findE),value.slice(findE+1,value.length)]
			split[1]=parseFloat(split[1])
			if (split[0]=='') valueTemp.logarithm=split[1]
			else {
				split[0]=parseFloat(split[0])
				valueTemp.logarithm=Math.log10(split[0])+split[1]
			}
			return valueTemp
		}

		fromString() {
			return Decimal.fromString(this)
		}

		static fromMantissaExponent(m,e) {
			var value=new Decimal()
			value.logarithm=e+Math.log10(m)
			return value
		}

		static toString(value) {
			value=new Decimal(value)
			if (value.logarithm==Number.NEGATIVE_INFINITY) return '0'
			if (value.logarithm==Number.POSITIVE_INFINITY) {
				return 'Infinity'
			}
			if (value.logarithm>=1e21||value.logarithm<=-1e21) {
				return 'e'+value.logarithm
			}
			if (value.logarithm>=21||value.logarithm<-6) {
				var logInt=Math.floor(value.logarithm)
				return Math.pow(10,value.logarithm-logInt)+'e'+logInt
			}
			return Math.pow(10,value.logarithm).toString()
		}

		toString() {
			return Decimal.toString(this)
		}

		static toNumber(value) {
			value=new Decimal(value)
			if (value.logarithm>=309) return Number.POSITIVE_INFINITY
			if (value.logarithm<=-309) return 0
			return Math.pow(10,value.logarithm)
		}

		toNumber() {
			return Decimal.toNumber(this)
		}

		static toPrecision(value,dp) {
			value=new Decimal(value)
			if (value.logarithm==Number.NEGATIVE_INFINITY) return (0).toPrecision(dp)
			if (value.logarithm==Number.POSITIVE_INFINITY) {
				return 'Infinity'
			}
			if (value.logarithm>=1e21||value.logarithm<=-1e21) {
				return 'e'+value.logarithm
			}
			if (value.logarithm>=dp||value.logarithm<6) {
				var logInt=Math.floor(value.logarithm)
				return Math.pow(10,value.logarithm-logInt).toPrecision(dp)+'e'+logInt
			}
			return Math.pow(10,value.logarithm).toPrecision(dp)
		}

		toPrecision(dp) {
			return Decimal.toPrecision(this,dp)
		}

		static toFixed(value,dp) {
			value=new Decimal(value)
			if (value.logarithm<-dp-1) return (0).toFixed(dp)
			if (value.logarithm==Number.POSITIVE_INFINITY) {
				return 'Infinity'
			}
			if (value.logarithm>=1e21) {
				return 'e'+value.logarithm
			}
			if (value.logarithm>=21) {
				return Math.pow(10,value.logarithm%1).toFixed(dp)+'e'+Math.floor(value.logarithm)
			}
			return Math.pow(10,value.logarithm).toFixed(dp)
		}

		toFixed(dp) {
			return Decimal.toFixed(this,dp)
		}

		static toExponential(value,dp) {
			value=new Decimal(value)
			if (value.logarithm==Number.NEGATIVE_INFINITY) return (0).toExponential(dp)
			if (value.logarithm==Number.POSITIVE_INFINITY) {
				return 'Infinity'
			}
			if (value.logarithm>=1e21||value.logarithm<=-1e21) {
				return 'e'+value.logarithm
			}
			var logInt=Math.floor(value.logarithm)
			return Math.pow(10,value.logarithm-logInt).toFixed(dp)+'e'+logInt
		}

		toExponential(dp) {
			return Decimal.toExponential(this,dp)
		}

		static add(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			var expdiff=value1.logarithm-value2.logarithm
			if (expdiff>=15||value2.logarithm==Number.NEGATIVE_INFINITY) return value1
			if (expdiff<=-15||value1.logarithm==Number.NEGATIVE_INFINITY) return value2
			value2.logarithm=value2.logarithm+Math.log10(1+Math.pow(10,expdiff))
			return value2
		}

		add(value) {
			return Decimal.add(this,value)
		}

		static plus(value1,value2) {
			return Decimal.add(value1,value2)
		}

		plus(value) {
			return Decimal.add(this,value)
		}

		static sub(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			var expdiff=value1.logarithm-value2.logarithm
			if (expdiff>=15||value2.logarithm==Number.NEGATIVE_INFINITY) return value1
			value1.logarithm=value1.logarithm+Math.log10(1-Math.pow(10,-expdiff))
			return value1
		}

		sub(value) {
			return Decimal.sub(this,value)
		}

		static subtract(value1,value2) {
			return Decimal.sub(value1,value2)
		}

		subtract(value) {
			return Decimal.sub(this,value)
		}

		static minus(value1,value2) {
			return Decimal.sub(value1,value2)
		}

		minus(value) {
			return Decimal.sub(this,value)
		}

		static mul(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			value1.logarithm=value1.logarithm+value2.logarithm
			return value1
		}

		mul(value) {
			return Decimal.mul(this,value)
		}

		static multiply(value1,value2) {
			return Decimal.mul(value1,value2)
		}

		multiply(value) {
			return Decimal.mul(this,value)
		}

		static times(value1,value2) {
			return Decimal.mul(value1,value2)
		}

		times(value) {
			return Decimal.mul(this,value)
		}

		static div(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			value1.logarithm=value1.logarithm-value2.logarithm
			return value1
		}

		div(value) {
			return Decimal.div(this,value)
		}

		static divide(value1,value2) {
			return Decimal.div(value1,value2)
		}

		divide(value) {
			return Decimal.div(this,value)
		}

		static divideBy(value1,value2) {
			return Decimal.div(value1,value2)
		}

		divideBy(value) {
			return Decimal.div(this,value)
		}

		static dividedBy(value1,value2) {
			return Decimal.div(value1,value2)
		}

		dividedBy(value) {
			return Decimal.div(this,value)
		}

		static recip(value) {
			value=new Decimal(value)
			value.logarithm=-value.logarithm
			return value
		}

		recip() {
			return Decimal.recip(this)
		}

		static reciprocal(value) {
			return Decimal.recip(value)
		}

		reciprocal() {
			return Decimal.recip(this)
		}

		static reciprocate(value) {
			return Decimal.recip(value)
		}

		reciprocate() {
			return Decimal.recip(this)
		}

		static mod(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			var expdiff=value1.logarithm-value2.logarithm
			if (expdiff<0) return value1
			if (expdiff>=15) value2.logarithm=Number.NEGATIVE_INFINITY
			else value2.logarithm=value2.logarithm+Math.log10(Math.pow(10,expdiff)%1)
			return value2
		}

		mod(value) {
			return Decimal.mod(this,value)
		}

		static remainder(value1,value2) {
			return Decimal.mod(value1,value2)
		}

		remainder(value) {
			return Decimal.mod(this,value)
		}

		static pow(value,power) {
			value=new Decimal(value)
			value.logarithm=value.logarithm*power
			return value
		}

		pow(value) {
			return Decimal.pow(this,value)
		}

		static power(value,power) {
			return Decimal.pow(value,power)
		}

		power(value) {
			return Decimal.pow(this,value)
		}

		pow_base(value) {
			return Decimal.pow(value,this)
		}

		static sqr(value) {
			value=new Decimal(value)
			value.logarithm=value.logarithm*2
			return value
		}

		sqr() {
			return Decimal.square(this)
		}

		static square(value) {
			return Decimal.sqr(value)
		}

		square() {
			return Decimal.sqr(this)
		}

		static cub(value) {
			value=new Decimal(value)
			value.logarithm=value.logarithm*3
			return value
		}

		cub() {
			return Decimal.cube(this)
		}

		static cube(value) {
			return Decimal.cub(value)
		}

		cube() {
			return Decimal.cub(this)
		}

		static exp(value) {
			value=new Decimal(value)
			value.logarithm=value.logarithm*Math.log10(Math.E)
			return value
		}

		exp() {
			return Decimal.exp(this)
		}

		static root(value,power) {
			value=new Decimal(value)
			value.logarithm=value.logarithm/power
			return value
		}

		root(value) {
			return Decimal.root(this,value)
		}

		static sqrt(value) {
			value=new Decimal(value)
			value.logarithm=value.logarithm/2
			return value
		}

		sqrt() {
			return Decimal.sqrt(this)
		}

		static cbrt(value) {
			value=new Decimal(value)
			value.logarithm=value.logarithm/3
			return value
		}

		cbrt() {
			return Decimal.cbrt(this)
		}

		static log10(value) {
			value=new Decimal(value)
			return value.logarithm
		}

		log10() {
			return this.logarithm
		}

		static log10integer(value) {
			value=new Decimal(value)
			return Math.floor(value.logarithm)
		}

		log10integer() {
			return Decimal.log10integer(this)
		}

		static log10remainder(value) {
			value=new Decimal(value)
			return value.logarithm-Math.floor(value.logarithm)
		}

		log10remainder() {
			return Decimal.log10remainder(this)
		}

		static log2(value) {
			value=new Decimal(value)
			if (value.logarithm >= 5.411595565927716e+307) {
				value.logarithm = Math.log10(value.logarithm) + Math.log10(3.32192809488736234787)
				return value
			}
			return value.logarithm*3.32192809488736234787
		}

		log2() {
			return Decimal.log2(this)
		}

		static log(value,base) {
			value=new Decimal(value)
			base=new Decimal(base)
			return value.logarithm/base.logarithm
		}

		log(base) {
			return Decimal.log(this,base)
		}

		static logarithm(value,base) {
			return Decimal.log(value,base)
		}

		logarithm(base) {
			return Decimal.log(this,base)
		}

		static ln(value) {
			value=new Decimal(value)
			return value.logarithm*2.30258509299404568402
		}

		ln() {
			return this.logarithm*2.30258509299404568402
		}

		static floor(value) {
			value=new Decimal(value)
			if (value.logarithm<0) value.logarithm=Number.NEGATIVE_INFINITY
			else if (value.logarithm<15) value.logarithm=Math.log10(Math.floor(Math.pow(10,value.logarithm)+Math.pow(10,value.logarithm-14)))
			return value
		}

		floor() {
			return Decimal.floor(this)
		}

		static ceil(value) {
			value=new Decimal(value)
			if (value.logarithm==Number.NEGATIVE_INFINITY) return value
			else if (value.logarithm<0) value.logarithm=0
			else if (value.logarithm<15) value.logarithm=Math.log10(Math.ceil(Math.pow(10,value.logarithm)-Math.pow(10,value.logarithm-14)))
			return value
		}

		ceil() {
			return Decimal.ceil(this)
		}

		static round(value) {
			value=new Decimal(value)
			if (value.logarithm<=-1) value.logarithm=Number.NEGATIVE_INFINITY
			else if (value.logarithm<15) value.logarithm=Math.log10(Math.round(Math.pow(10,value.logarithm)))
			return value
		}

		round() {
			return Decimal.round(this)
		}

		static min(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			if (value1.logarithm>value2.logarithm) return value2
			return value1
		}

		min(value) {
			return Decimal.min(this,value)
		}

		static max(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			if (value1.logarithm>value2.logarithm) return value1
			return value2
		}

		max(value) {
			return Decimal.max(this,value)
		}

		static cmp(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			if (value1.logarithm>value2.logarithm) return 1
			if (value1.logarithm<value2.logarithm) return -1
			return 0
		}

		compareTo(value) {
			return Decimal.cmp(this,value)
		}

		static compare(value1,value2) {
			return Decimal.cmp(value1,value2)
		}

		compare(value) {
			return Decimal.cmp(this,value)
		}

		static compareTo(value1,value2) {
			return Decimal.cmp(value1,value2)
		}

		compareTo(value) {
			return Decimal.cmp(this,value)
		}

		static lt(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			return value1.logarithm<value2.logarithm
		}

		lt(value) {
			return Decimal.lt(this,value)
		}

		static lte(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			return value1.logarithm<=value2.logarithm
		}

		lte(value) {
			return Decimal.lte(this,value)
		}

		static eq(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			return value1.logarithm==value2.logarithm
		}

		eq(value) {
			return Decimal.eq(this,value)
		}

		static equals(value1,value2) {
			return Decimal.eq(value1,value2)
		}

		equals(value) {
			return Decimal.eq(this,value)
		}

		static neq(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			return value1.logarithm!=value2.logarithm
		}

		neq(value) {
			return Decimal.neq(this,value)
		}

		static notEquals(value1,value2) {
			return Decimal.neq(value1,value2)
		}

		notEquals(value) {
			return Decimal.neq(this,value)
		}

		static gte(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			return value1.logarithm>=value2.logarithm
		}

		gte(value) {
			return Decimal.gte(this,value)
		}

		static gt(value1,value2) {
			value1=new Decimal(value1)
			value2=new Decimal(value2)
			return value1.logarithm>value2.logarithm
		}

		gt(value) {
			return Decimal.gt(this,value)
		}

		static isFinite(value) {
			value=new Decimal(value)
			return value.logarithm<Number.POSITIVE_INFINITY
		}

		isFinite() {
			return Decimal.isFinite(this)
		}

		get mantissaAndExponent() {
			if (this.logarithm==Number.NEGATIVE_INFINITY) return {m:0,e:0}
			var logInt=Math.floor(this.logarithm)
			return {m:Math.pow(10,this.logarithm-logInt),e:logInt}
		}
		get e() {
			if (this.logarithm==Number.NEGATIVE_INFINITY) return 0
			return Math.floor(this.logarithm)
		}
		get exponent() {return this.e;}
		get m() {
			if (this.logarithm==Number.NEGATIVE_INFINITY) return 0
			var logInt=Math.floor(this.logarithm)
			return Math.pow(10,this.logarithm-logInt)
		}
		get mantissa() {return this.m;}

		valueOf() { return this.toString(); }
		toJSON() { return this.toString(); }
	}

	//Used from Patashu's break_infinity.js (and credited the author too, https://github.com/Patashu/break_infinity.js)
	if (typeof define == 'function' && define.amd) {
		define(function () {
		return Decimal;
	});

	// Node and other environments that support module.exports.
	} else if (typeof module != 'undefined' && module.exports) {
		module.exports = Decimal;

	// Browser.
	} else {
	if (!globalScope) {
		globalScope = typeof self != 'undefined' && self && self.self == self
		? self : Function('return this')();
	}

	var noConflict = globalScope.Decimal;
	Decimal.noConflict = function () {
		globalScope.Decimal = noConflict;
		return Decimal;
	};

	globalScope.Decimal = Decimal;
	}
})(this);
