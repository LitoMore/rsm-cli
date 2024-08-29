import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import got from 'got';
import ow from 'ow';
import {Resume, StyledText, TargetType} from './types.js';

export const parsePlainText = (styledText: StyledText): string =>
	typeof styledText === 'string' ? styledText : styledText.text;

const styledText = ow.any(
	ow.string,
	ow.object.exactShape({text: ow.string, url: ow.optional.string}),
);

export const checkResume = ow.create(
	ow.object.exactShape({
		firstName: ow.string,
		lastName: ow.string,
		sections: ow.array.ofType(
			ow.object.exactShape({
				title: styledText,
				experiences: ow.array.ofType(
					ow.object.exactShape({
						title: styledText,
						subtitle: styledText,
						tag: styledText,
						subtag: styledText,
					}),
				),
			}),
		),
		borderStyle: ow.optional.string,
	}),
);

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
