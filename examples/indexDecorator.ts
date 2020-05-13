// @ts-nocheck
import loggerWrapper from './bin/logger';
import 'reflect-metadata';
import { ModuleChecker } from './checker';

import { ServiceBroker } from 'moleculer';
import posts from './posts.service';
import { start } from './utils';
import { testCasesFiller } from './checkerTestCases';

const { extend } = require('moleculer').Loggers.Base;
const broker = new ServiceBroker({
	logLevel: 'debug',
	logger: (bindings: any) => extend(loggerWrapper(bindings)),
});

broker.createService(posts);

const checker = new ModuleChecker(11);

testCasesFiller(broker, checker);
start(broker, checker);
