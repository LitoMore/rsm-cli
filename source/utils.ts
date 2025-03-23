import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import got from 'got';
import {readPackageUpSync} from 'read-package-up';
import {ZodError, ZodIssueCode, z} from 'zod';
import {ErrorMessageItem, Resume, StyledText, TargetType} from './types.js';

export const parsePlainText = (styledText: StyledText): string =>
	typeof styledText === 'string' ? styledText : styledText.text;

export const getResumeVersion = () => {
	const package_ = readPackageUpSync() ?? {packageJson: {version: '0.0.0'}};
	const [, minor = '0'] = package_.packageJson.version.split('.');
	return Number.parseInt(minor, 10);
};

const resumeVersion = getResumeVersion();

const styledText = z.union([
	z.string(),
	z.object({text: z.string(), url: z.optional(z.string())}),
]);

export const zodResume = z.object({
	// Version: z.literal(resumeVersion),
	firstName: z.string(),
	lastName: z.string(),
	sections: z.array(
		z.object({
			title: styledText,
			experiences: z.array(
				z.object({
					title: styledText,
					subtitle: styledText,
					tag: styledText,
					subtag: styledText,
				}),
			),
		}),
	),
	borderStyle: z.string().optional(),
});

export const getTargetPath = (targetType: TargetType, target: string) => {
	switch (targetType) {
		case 'github': {
			target = `${target}/${target}`;
			return `https://raw.githubusercontent.com/${target}/main/resume.json`;
		}

		case 'file': {
			return path.resolve(process.cwd(), target);
		}

		default: {
			return target;
		}
	}
};

export const loadResume = async (targetType: TargetType, target: string) => {
	target = getTargetPath(targetType, target);
	switch (targetType) {
		case 'url': {
			const resume = await got(target).json<Resume>();
			return resume;
		}

		case 'file': {
			const resume = JSON.parse(await fs.readFile(target, 'utf8')) as Resume;
			return resume;
		}

		case 'github': {
			const resume = await got(target).json<Resume>();
			return resume;
		}

		default: {
			throw new Error('Invalid resume path');
		}
	}
};

export const formatPath = (path: Array<string | number>): string => {
	// eslint-disable-next-line unicorn/no-array-reduce
	return path.reduce((accumulator: string, path) => {
		if (typeof path === 'string') return `${accumulator}.${path}`;
		if (typeof path === 'number') return `${accumulator}[${path}]`;
		return accumulator;
	}, '');
};

export const formatZodError = (error: ZodError): ErrorMessageItem[] => {
	const errors = error.issues.map((issue) => {
		if (
			issue.code === ZodIssueCode.invalid_literal &&
			issue.path.includes('version')
		) {
			return {
				title: formatPath(issue.path),
				message: `Unsupported resume version v${String(issue.received)}. You resume version is v${resumeVersion}`,
			};
		}

		const title = formatPath(issue.path);
		const message =
			issue.code === ZodIssueCode.invalid_union
				? issue.unionErrors
						.map((error) => error.issues.map((x) => x.message).join('\n'))
						.join('\n')
				: issue.message;
		return {title, message};
	});
	return errors;
};
