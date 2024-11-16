// components/ViewReservation.js
import React, { useState, useEffect } from 'react';
import '../CSS/UploadLicense.css';
import '../CSS/ReserveVehicle.css';

import { getVehicleData } from '../services/vehicleService';

function ViewRes({token, reservationData}) {
    const [vehicles, setVehicles] = useState([]); 
    const [userVehicle, setUserVehicle] = useState(null); 

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
            const vehicleSnapshot = await getVehicleData(token);
            if (vehicleSnapshot.success) {
                setVehicles(vehicleSnapshot.data);
            } 
            } catch (error) {
            console.log(error);
            }
        };
        fetchVehicles();
    }, [token]);

    useEffect(() => {
        // Fetch user reservation only after `reservations` and `uid` have been set
        if (vehicles.length > 0) {
        const userRes = vehicles.find(res => res.vehicleId === reservationData.vehicleId);
        setUserVehicle(userRes);
        }
    }, [vehicles]);

    

    if(userVehicle) return(
      <div className="reservation-container">
        <h2>Your Current Reservation</h2>
            <table className="vehicle-table">
                <tbody>
                <tr>
                    <td><strong>Vehicle Name:</strong></td>
                    <td>{userVehicle.vehicleName}</td>
                </tr>
                <tr>
                    <td><strong>Start Date:</strong></td>
                    <td>{reservationData.startDate}</td>
                </tr>
                <tr>
                    <td><strong>End Date:</strong></td>
                    <td>{reservationData.endDate}</td>
                </tr>
                <tr>
                    <td><strong>Status:</strong></td>
                    <td>{reservationData.status}</td>
                </tr>
                </tbody>
            </table>
      </div>
    )

    return(<></>);
}

export default ViewRes;