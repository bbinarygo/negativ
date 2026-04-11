import type { Meta, StoryObj } from '@storybook/react';
import NegativError from './NegativError';

const meta: Meta = { component: NegativError };
export default meta;

export const ValidationRequired: StoryObj = {
    args: { code: 'NEG-400-validation-required' },
    parameters: { docs: { description: 'Uses centralized messageKey' } }
};