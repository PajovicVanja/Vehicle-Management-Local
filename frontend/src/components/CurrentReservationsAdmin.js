import React, { useState, useEffect } from 'react';
import '../CSS/Reservations.css';


function CurrentReservationsAdmin({ token, setShowAllCarReservations  }) {

    const reservations = [
        {
            id: 1,
            carId: 109675678,
            carModel: 'BMW 3 Series',
            customerId: 543775345,
            customerName: 'Janez Novak',
            startDate: '2024-10-01',
            endDate: '2024-10-05',
            status: 'Active',
        },
        {
            id: 2,
            carId: 875965452,
            carModel: 'Volkswagen Golf',
            customerId: 876633333,
            customerName: 'Franc Najlepši',
            startDate: '2024-10-02',
            endDate: '2024-10-06',
            status: 'Active',
        },
        {
            id: 3,
            carId: 99655310,
            carModel: 'Mercedes-Benz C-Class',
            customerId: 886767498,
            customerName: 'Alica Čudežna',
            startDate: '2024-10-03',
            endDate: '2024-10-07',
            status: 'Active',
        },
        {
            id: 4,
            carId: 86770111,
            carModel: 'Peugeot 307cc',
            customerId: 23443234,
            customerName: 'Borat Gorazd',
            startDate: '2024-10-03',
            endDate: '2024-10-07',
            status: 'Inactive',
        },
    ];

    return (
        <div className="reservations-container">
            <h2>Current Car Reservations</h2>
            <table className="reservations-table">
                <thead>
                    <tr>
                        <th>Car ID</th>
                        <th>Car Model</th>
                        <th>Customer ID</th>
                        <th>Customer Name</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.map((reservation) => (
                        <tr key={reservation.id}>
                            <td className='id-column'>{reservation.carId}</td>
                            <td>{reservation.carModel}</td>
                            <td className='id-column'>{reservation.customerId}</td>
                            <td>{reservation.customerName}</td>
                            <td>{reservation.startDate}</td>
                            <td>{reservation.endDate}</td>
                            <td className={`status ${reservation.status.toLowerCase()}`}>{reservation.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={() => setShowAllCarReservations(false)} className='goto-register-button'>Back to Dashboard</button>
        </div>
    );


}
export default CurrentReservationsAdmin;