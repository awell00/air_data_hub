import React, {FC, createRef, useState, useEffect } from 'react';
import styled from 'styled-components';

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
        // Ignore non-digit inputs and allow empty strings for deletion
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


const Div = styled.div`
    display: flex;
    justify-content: center;
    margin: 10px 30px;

    @media (max-width: 450px) {
        margin: 3vw;
    }
`;

const Input = styled.input`
    width: 3rem;
    height: 4.3rem;
    font-size: 1.5rem;
    text-align: center;
    padding: 1rem;
    margin: 0 0.7rem;
    border: 1.5px solid #dcdcdc;
    border-radius: 7px;
    font-family: 'FoundersGrotesk-Regular', sans-serif;

    @media (max-width: 450px) {
        width: 10vw;
        height: 15vw;
        font-size: 5vw;
        padding: 1vw;
        margin: 0 2.8vw;

    }
`;


