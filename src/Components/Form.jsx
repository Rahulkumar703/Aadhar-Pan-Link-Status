import { useEffect, useRef, useState } from 'react';
import './Form.css';
import Loader from './Loader';
import axios from 'axios';

export default function Form() {

    const [formData, setFormData] = useState({
        aadharNumber: '',
        panNumber: ''
    });

    const [loading, setLoading] = useState(false);

    const [aadharMessage, setAadharMessage] = useState(null);
    const [panMessage, setPanMessage] = useState(null);
    const [resultMessage, setResultMessage] = useState('');



    const panRef = useRef(null);
    const aadharRef = useRef(null);

    useEffect(() => {
        panRef.current.focus();
    }, [])

    const handelChange = (e) => {
        setFormData((prev) => {
            return { ...prev, [e.target.name]: e.target.value }
        })
    }

    const resetMessages = () => {
        panRef.current.classList.remove('error');
        aadharRef.current.classList.remove('error');
        setAadharMessage(null);
        setPanMessage(null);
        setResultMessage(null);
    }

    const resetForm = () => {
        setFormData({
            panNumber: '',
            aadharNumber: ''
        });
        resetMessages();
        panRef.current.focus();
    }

    const handelSubmit = async (e) => {
        e.preventDefault();
        resetMessages();

        try {
            setLoading(true);

            const { data } = await axios.post('https://eportal.incometax.gov.in/iec/servicesapi/saveEntity', {
                pan: formData.panNumber,
                aadhaarNumber: formData.aadharNumber,
                serviceName: "linkAadhaarValidationService",
                createdBy: "linkAadhaarValidationService",
                createdByUser: formData.panNumber,
                preLoginFlag: "Y",
                updatedBy: "linkAadhaarValidationService",
                updatedByUser: formData.panNumber
            }, {
                headers: {
                    Accept: "application/json, text/plain, */*"
                }
            });

            handelMessages(data);
        } catch (error) {
            setResultMessage(error.message)
        }
        finally {
            setLoading(false);
        }
    }

    const handelMessages = (data) => {
        if (data.messages[0].code === "EF40021") {
            panRef.current.classList.add('error');
            setPanMessage(data.messages[0].desc);
            panRef.current.focus();
        }
        else if (data.messages[0].code === "EF40077") {
            aadharRef.current.classList.add('error');
            setAadharMessage(data.messages[0].desc);
            aadharRef.current.focus();
        }
        else
            setResultMessage(data.messages[0].desc);
    }

    return (
        <>
            <form onSubmit={handelSubmit}>
                <div className="input_container">
                    <input
                        ref={panRef}
                        type="text"
                        name="panNumber"
                        id="pan-number"
                        value={formData.panNumber}
                        onChange={handelChange}
                        placeholder='ABC123FK5'
                        autoComplete='pan'
                    />
                    <label htmlFor="pan-number">Pan Number</label>
                    {
                        panMessage ? <p>{panMessage}</p> : null
                    }
                </div>
                <div className="input_container">
                    <input
                        ref={aadharRef}
                        type="number"
                        name="aadharNumber"
                        id="aadhar-number"
                        value={formData.aadharNumber}
                        onChange={handelChange}
                        placeholder='1234 1234 1234'
                        autoComplete='aadhar'
                    />
                    {
                        aadharMessage ? <p>{aadharMessage}</p> : null
                    }
                    <label htmlFor="aadhar-number">Aadhar Number</label>
                </div>
                <div className="action_buttons">
                    <button type="button" onClick={resetForm} >Clear</button>
                    <button type='submit' >Check Status</button>
                </div>
            </form>
            {
                loading ?
                    <div className="loader_container">
                        <Loader />
                    </div>
                    :
                    resultMessage ?
                        <div className="message_container">
                            <p>{resultMessage}</p>
                        </div>
                        : null
            }
        </>
    )
}
