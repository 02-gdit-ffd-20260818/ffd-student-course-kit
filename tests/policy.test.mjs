import test from 'node:test'
import assert from 'node:assert/strict'
import { checkRequestRate } from '../src/services/requestPolicy.js'
test('allows two requests per minute and then returns retry time', () => { const history = new Map(); assert.equal(checkRequestRate(history,'小满',1000).allowed,true); assert.equal(checkRequestRate(history,'小满',2000).allowed,true); const third=checkRequestRate(history,'小满',3000); assert.equal(third.allowed,false); assert.equal(third.retryAfterMs,58000) })
test('request budget recovers after the time window', () => { const history=new Map([['小满',[1000,2000]]]); assert.equal(checkRequestRate(history,'小满',62001).allowed,true) })
