#!/usr/bin/env node
import React, {useEffect, useState} from 'react';
import {Box, Text, render} from 'ink';
import Color from 'ink-color-pipe';
import logSymbols from 'log-symbols';
import meow from 'meow';
import {Section} from './componets.js';
import {Spinner} from './spinner.js';
import {Resume, TargetType} from './types.js';
import {
	checkResume,
	getTargetPath,
	loadResume,
	parsePlainText,
} from './utils.js';

const cli = meow(
	`
  Usage
    $ rsm-cli <resume>

  Example
    $ rsm-cli LitoMore
    $ rsm-cli LitoMore/LitoMore
    $ rsm-cli https://example.com/resume.json
    $ rsm-cli path/to/resume.json
`,
	{
		importMeta: import.meta,
	},
);

const githubHandlePattern =
	/^[a-z\d](?:[a-z\d]|-(?!-)){0,38}(|[a-z\d](?:[a-z\d]|-(?!-)){0,38})?$/i;

let targetType: TargetType = 'unknown';
let [target = ''] = cli.input;
target = target.trim();

if (/^https?:\/\//.test(target)) targetType = 'url';
else if (target.endsWith('.json')) targetType = 'file';
else if (githubHandlePattern.test(target)) targetType = 'github';

function App() {
	const [resume, setResume] = useState<Resume>();
	const [errorName, setErrorName] = useState<string>();
	const [errorMessage, setErrorMessage] = useState<string>();
	const [errorUrl, setErrorUrl] = useState<string>();

	const showError = (error: Error) => {
		setErrorName(error?.name || 'UnknownErrror');
		setErrorMessage(error?.message || 'There were some errors.');
		setErrorUrl(getTargetPath(targetType, target));
	};

	useEffect(() => {
		if (!target) return;
		const fetchResume = async () => {
			try {
				const resume = await loadResume(targetType, target);
				checkResume(resume);
				setResume(resume);
			} catch (error) {
				showError(error as Error);
			}
		};

		void fetchResume();
	}, []);

	if (!target) {
		return <Text>{logSymbols.error} Please specify a target resume</Text>;
	}

	if (errorMessage) {
		const isArgumentError = errorName === 'ArgumentError';
		return (
			<Box
				borderStyle={resume?.borderStyle ?? 'classic'}
				flexDirection="column"
			>
				<Box justifyContent="center">
					<Color styles="bgRed.white"> {errorName} </Color>
				</Box>
				<Box
					borderStyle={isArgumentError ? 'round' : undefined}
					flexDirection="column"
					justifyContent="center"
					marginLeft={1}
					marginRight={1}
				>
					{errorMessage.split('\n').map((line, index) => (
						<Box
							key={`line-${String(index)}`}
							justifyContent={isArgumentError ? 'flex-start' : 'center'}
						>
							<Text>{line}</Text>
						</Box>
					))}
				</Box>
				{errorUrl && (
					<Box justifyContent="center">
						<Color styles="cyan">{errorUrl}</Color>
					</Box>
				)}
			</Box>
		);
	}

	if (!resume) {
		return (
			<Box>
				<Text>
					<Spinner type="dots" /> Fetching resume from{' '}
					<Color styles="cyan">{target}</Color>
				</Text>
			</Box>
		);
	}

	return (
		<Box borderStyle={resume.borderStyle ?? 'classic'} flexDirection="column">
			<Box justifyContent="center">
				<Text>
					{resume.firstName}{' '}
					<Color styles="orange.bold">{resume.lastName}</Color>
				</Text>
			</Box>
			{resume.sections.map((section, index) => (
				<Section
					key={`section-${parsePlainText(section.title)}-${String(index)}`}
					{...section}
				/>
			))}
		</Box>
	);
}

render(<App />);
