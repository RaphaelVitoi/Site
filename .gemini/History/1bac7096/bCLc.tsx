import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MasterSimulator from '../MasterSimulator';

describe('MasterSimulator Component', () => {
    it('renders the component without crashing', () => {
        render(<MasterSimulator />);
    });

    it('updates risk premium when the slider is moved', () => {
        render(<MasterSimulator />);
        const slider = screen.getByRole('slider') as HTMLInputElement;
        fireEvent.change(slider, { target: { value: '0.2' } });
        expect(slider.value).toBe('0.2');
    });

    it('updates pot size when the number input is changed', () => {
        render(<MasterSimulator />);
        const potSizeInput = screen.getByLabelText(/Pote \(BB\)/i) as HTMLInputElement;
        fireEvent.change(potSizeInput, { target: { value: '15' } });
        expect(potSizeInput.value).toBe('15');
    });

    it('applies archetype when an archetype button is clicked', () => {
        render(<MasterSimulator />);
        const pactoSilen