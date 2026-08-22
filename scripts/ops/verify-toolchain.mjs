#!/usr/bin/env node
/**
 * Fails before a quality gate runs on a package-manager implementation that
 * cannot reproduce this monorepo's lockfile/workspace contract.
 */
import process from 'node:process';

const REQUIRED_NODE_MAJOR = 22;
const REQUIRED_NPM = '10.9.2';

const nodeMajor = Number.parseInt(process.versions.node.split('.')[0] ?? '', 10);
if (!Number.isInteger(nodeMajor) || nodeMajor < REQUIRED_NODE_MAJOR) {
	throw new Error(
		`Node ${REQUIRED_NODE_MAJOR}+ is required; found ${process.versions.node}. ` +
			'Use the project bootstrap command: npm run bootstrap.'
	);
}

const userAgent = process.env.npm_config_user_agent ?? '';
const npmMatch = /npm\/(\d+\.\d+\.\d+)/.exec(userAgent);
const npmVersion = npmMatch?.[1];
if (npmVersion !== REQUIRED_NPM) {
	throw new Error(
		`npm ${REQUIRED_NPM} is required for this workspace lockfile; found ${npmVersion ?? 'unknown'}. ` +
		'Run commands through Corepack: corepack npm <command>.'
	);
}

console.log(`Toolchain verified: Node ${process.versions.node}; npm ${npmVersion}.`);
