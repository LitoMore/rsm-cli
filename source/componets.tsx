import React, {Fragment} from 'react';
import {Box} from 'ink';
import Color from 'ink-color-pipe';
import terminalLink from 'terminal-link';
import {SectionProperties, StyledText} from './types.js';
import {parsePlainText} from './utils.js';

export function Styled({
	text,
	defaultStyle,
}: {
	text: StyledText;
	defaultStyle?: string;
}) {
	if (typeof text === 'string') {
		return <Color styles={defaultStyle}>{text}</Color>;
	}

	const {styles = defaultStyle, text: txt, url} = text;
	return <Color styles={styles}>{url ? terminalLink(txt, url) : txt}</Color>;
}

export function Section({
	title,
	experiences,
	borderStyle = 'round',
}: SectionProperties) {
	return (
		<Box
			borderStyle={borderStyle}
			flexDirection="column"
			marginLeft={1}
			marginRight={1}
			paddingLeft={1}
			paddingRight={1}
		>
			<Styled defaultStyle="orange.bold" text={title} />
			{experiences.map(({title, subtitle, tag, subtag}, index) => (
				<Fragment key={`exp-${parsePlainText(title)}}-${String(index)}`}>
					<Box justifyContent="space-between" marginTop={index > 0 ? 1 : 0}>
						<Styled defaultStyle="bold" text={title} />
						<Styled defaultStyle="cyan" text={tag} />
					</Box>
					<Box justifyContent="space-between">
						<Styled text={subtitle} />
						<Styled text={subtag} />
					</Box>
				</Fragment>
			))}
		</Box>
	);
}
