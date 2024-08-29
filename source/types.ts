import {BoxProps} from 'ink';

export type Resume = {
	firstName: string;
	lastName: string;
	sections: SectionProperties[];
	borderStyle?: BoxProps['borderStyle'];
};

export type StyledText =
	| string
	| {
			text: string;
			styles?: string;
			url?: string;
	  };

export type Experience = {
	title: StyledText;
	subtitle: StyledText;
	tag: StyledText;
	subtag: StyledText;
};

export type SectionProperties = {
	title: StyledText;
	experiences: Experience[];
	borderStyle?: BoxProps['borderStyle'];
};

export type TargetType = 'url' | 'file' | 'github' | 'unknown';
