// Importing necessary hooks and types from 'react'
import React, { FC, useState, useEffect } from 'react';

// Importing 'styled-components' for component styling
import styled from 'styled-components';

// Types and interfaces
interface VerificationCodeInputProps {
    onCodeChange: (code: number) => void;
    isVerificationCodeValid: boolean;
    setVerificationCodeValid: (isValid: boolean) => void;
}

const VerificationCodeInput: FC<VerificationCodeInputProps> = ({ onCodeChange, isVerificationCodeValid, setVerificationCodeValid }) => {
    const [code, setCode] = useState(Array(6).fill('')); // Initialize state with an array of 6 empty strings
    const inputs: React.RefObject<HTMLInputElement>[] = Array(6).fill(0).map((_, i) => React.createRef<HTMLInputElement>());

    useEffect(() => {
        onCodeChange(parseInt(code.join(''), 10))
    }, [code, onCodeChange]);

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        if (pastedData.length === code.length && /^\d+$/.test(pastedData)) {
            const newCode = pastedData.split('');
            setCode(newCode);
            onCodeChange(parseInt(newCode.join(''), 10));
            if (inputs[inputs.length - 1].current) {
                inputs[inputs.length - 1].current?.focus();
            }
        }
    };

    const handleChange = (value: string, i: number) => {
        if (value !== '' && !/^\d+$/.test(value)) {
            return;
        }

        if (value === '' && i === 5) {
            setVerificationCodeValid(true);
        }

        setCode(prevCode => {
            const newCode = [...prevCode];
            newCode[i] = value;
            const newCodeInt = parseInt(newCode.join(''), 10);
            onCodeChange(newCodeInt);
            return newCode;
        });

        if (value === '' && i > 0 && inputs[i - 1].current) {
            inputs[i - 1].current?.focus();
        } else if (value && i < inputs.length - 1 && inputs[i + 1].current) {
            inputs[i + 1].current?.focus();
        }
    };

    return (
        <Div>
            {code.map((digit, i) => (
                <Input
                    key={i}
                    ref={inputs[i]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(e.target.value, i)}
                    onPaste={handlePaste}
                    style={{ borderColor: isVerificationCodeValid ? '#dcdcdc' : '#f25f4c' }}
                />
            ))}
        </Div>
    );
};

export default VerificationCodeInput;

// Define a styled div component for the container
const Div = styled.div`
    display: flex; // Use flex layout
    justify-content: center; // Center the content horizontally
    margin: 10px 30px; // Apply margin

    @media (max-width: 450px) { // Responsive design for screens smaller than 450px
        margin: 3vw; // Adjust margin
    }
`;

// Define a styled input component
const Input = styled.input`
    width: 3rem; // Set width
    height: 4.3rem; // Set height
    font-size: 1.5rem; // Set font size
    text-align: center; // Center the text
    padding: 1rem; // Apply padding
    margin: 0 0.7rem; // Apply margin
    border: 1.5px solid #dcdcdc; // Set border
    border-radius: 7px; // Set border radius
    font-family: 'FoundersGrotesk-Regular', sans-serif; // Set font family

    @media (max-width: 450px) { // Responsive design for screens smaller than 450px
        width: 10vw; // Adjust width
        height: 15vw; // Adjust height
        font-size: 5vw; // Adjust font size
        padding: 1vw; // Adjust padding
        margin: 0 2.8vw; // Adjust margin
    }
`;


