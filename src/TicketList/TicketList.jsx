import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TicketList.css';

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyMessage, setReplyMessage] = useState({});
    const [responseMessage, setResponseMessage] = useState("");
    const [username, setUsername] = useState(""); 
    const [expandedHistory, setExpandedHistory] = useState({}); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login"); 
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/tickets', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTickets(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchUsername = () => {
            const storedUsername = localStorage.getItem("username");
            if (storedUsername) {
                setUsername(storedUsername);
            } else {
                console.log("No username found in localStorage");
            }
        };

        fetchTickets();
        fetchUsername();
    }, [navigate]);

    const handleReplyChange = (ticketId, message) => {
        setReplyMessage(prev => ({
            ...prev,
            [ticketId]: message
        }));
    };

    const handleReplySubmit = async (ticketId, currentStatus) => {
        const replyText = replyMessage[ticketId];
        if (!replyText) {
            setResponseMessage("El mensaje no puede estar vacío.");
            return;
        }
    
        const token = localStorage.getItem("token");
        if (!token) {
            setResponseMessage("No estás autenticado. Por favor, inicia sesión.");
            return;
        }
    
        const messageId = `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
        try {
            const response = await fetch(`http://localhost:5000/tickets/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ticketId: ticketId,
                    replyMessage: replyText,
                    messageId: messageId,
                    status: currentStatus
                }),
            });
    
            if (response.ok) {
                
                const updatedTicket = await response.json();
                // Log the updated content and the original content
            console.log("Updated Ticket Content:", updatedTicket.content); // New content from server response
            const ticket = tickets.find(t => t._id === ticketId);  // Find the original ticket in state
            console.log("Original Ticket Content:", ticket ? ticket.content : "Ticket not found"); // Original content from state
    
                console.log("Server Response - Updated Ticket:", updatedTicket); // Log the full response
    
                setResponseMessage("Respuesta enviada correctamente.");
                setReplyMessage(prev => ({ ...prev, [ticketId]: "" }));
    
                // Update the tickets state while preserving original content and history
                setTickets(prevTickets => {
                    console.log("Tickets before update:", prevTickets); // Log tickets before update
                    return prevTickets.map(ticket => {
                        if (ticket._id === updatedTicket._id) {
                            return {
                                ...ticket,
                                // Preserve the original content; don't update it unless needed
                                
                                // Ensure the history is updated (new replies added)
                                history: updatedTicket.history,
                                status: updatedTicket.status,
                                date: updatedTicket.date,
                                messageId: updatedTicket.messageId,
                                references: updatedTicket.references,
                            };
                        }
                        return ticket;
                    });
                });
    
            } else {
                const errorData = await response.json();
                setResponseMessage(`Error al enviar la respuesta: ${errorData.message}`);
                console.error("Error Response:", errorData);
            }
        } catch (err) {
            setResponseMessage(`Error al procesar la solicitud: ${err.message}`);
            console.error("Error Processing Reply:", err);
        }
    };
    
    
    
    
    
     const handleDeleteTicket = async (ticketId) => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:5000/tickets/${ticketId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setTickets(tickets.filter(ticket => ticket._id !== ticketId));
                setResponseMessage("Ticket borrado correctamente");
            } else {
                const errorData = await response.json();
                setResponseMessage(`Error: ${errorData.message}`);
            }
        } catch (err) {
            setResponseMessage(`Error: ${err.message}`);
        }
    };

    const fetchHistory = async (ticketId) => {
        const token = localStorage.getItem("token");
    
        if (expandedHistory[ticketId]) {
            setExpandedHistory(prev => ({ ...prev, [ticketId]: null }));
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:5000/tickets/${ticketId}/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (!response.ok) {
                throw new Error('Error fetching history');
            }
            const history = await response.json();
            setExpandedHistory(prev => ({ ...prev, [ticketId]: history }));
        } catch (err) {
            setResponseMessage(`Error: ${err.message}`);
        }
    };
    

    const handleStatusChange = async (ticketId, newStatus) => {
        const token = localStorage.getItem("token");
    
        try {
            console.log("Attempting to change status to:", newStatus);
    
            const response = await fetch(`http://localhost:5000/api/tickets/status/${ticketId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
    
            if (response.ok) {
                const { ticket, canShowHistorialButtons } = await response.json();
                console.log("Updated ticket:", ticket);
    
                // Update the ticket status in the state
                setTickets((prevTickets) =>
                    prevTickets.map((t) =>
                        t._id === ticketId ? { ...t, status: newStatus } : t
                    )
                );
    
                // Update the visibility of the "Ver historial completo" button
                setExpandedHistory((prev) => ({
                    ...prev,
                    [ticketId]: canShowHistorialButtons ? expandedHistory[ticketId] : null,
                }));
    
                setResponseMessage("Estado actualizado correctamente");
            } else {
                const errorData = await response.json();
                setResponseMessage(`Error: ${errorData.message}`);
            }
        } catch (err) {
            setResponseMessage(`Error: ${err.message}`);
        }
    };
    
    
    
    


    const getStatusColor = (status) => {
        switch (status) {
            case 'resuelto':
                return 'green';
            case 'en proceso':
                return '#ddff33';
            case 'pendiente':
                return 'red';
            default:
                return 'gray';
        }
    };

    if (loading) {
        return <div className="ticket-list-container">Cargando Tickets...</div>;
    }

    if (error) {
        return <div className="ticket-list-container">Error: {error}</div>;
    }

    return (
        <div className="ticket-list-container">
            <div className="header">
                <h2 className="ticket-list-title">Tickets</h2>
                <div className="username-display">
                    {username ? <span>Hola, {username}</span> : <span>Cargando usuario...</span>}
                </div>
            </div>

            <p className="response-message">{responseMessage}</p>

            {tickets.length > 0 ? (
                tickets.map(ticket => (
                    <div key={ticket._id} className="ticket-item">
                        <div className="ticket-item-header">
                            <h3 className="ticket-subject">{ticket.subject}</h3>
                            
                            {/* Displaying sender and status under each other */}
                            <div className="ticket-sender-status">
                                <span className="ticket-sender">{ticket.sender}</span>
                                <select
                                        value={ticket.status}
                                        onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                                        style={{
                                            color: getStatusColor(ticket.status),
                                            fontWeight: "bold",
                                            padding: "5px",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <option value="pendiente" style={{ color: getStatusColor("pendiente") }}>
                                            Pendiente
                                        </option>
                                        <option value="en proceso" style={{ color: getStatusColor("en proceso") }}>
                                            En Proceso
                                        </option>
                                        <option value="resuelto" style={{ color: getStatusColor("resuelto") }}>
                                            Resuelto
                                        </option>
                                    </select>


                            </div>
                        </div>

                        

                        <p className="ticket-date">
                            {new Date(ticket.date).toLocaleString()}
                        </p>

                        <div
                            className="ticket-content"
                            dangerouslySetInnerHTML={{ __html: ticket.content }}
                        />

                        {ticket.historyCount > 0 && (
                            <button
                                className="history-button"
                                onClick={() => fetchHistory(ticket._id)}
                            >
                                {expandedHistory[ticket._id] ? 'Ocultar historial' : 'Ver historial completo'}
                            </button>
                        )}

                                    {expandedHistory[ticket._id] && (
                                        <div className="ticket-history">
                                            {expandedHistory[ticket._id].map((historyItem, index) => (
                                                <div key={index} className="history-item">
                                                    <div className="history-header">
                                                        {/* Display sender's email dynamically */}
                                                        <span className="history-sender">
                                                            {historyItem.sender === "System" 
                                                                ? "informatica@delvalle.com.ar" // Set to your email if it's "system"
                                                                : historyItem.sender}
                                                        </span>
                                                        {/* Display history date */}
                                                        <span className="history-date">{new Date(historyItem.date).toLocaleString()}</span>
                                                    </div>
                                                    <p className="history-content">{historyItem.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}




                        <textarea
                            className="reply-input"
                            placeholder="Escribe tu respuesta..."
                            value={replyMessage[ticket._id] || ""}
                            onChange={(e) => handleReplyChange(ticket._id, e.target.value)}
                        />
                        <button
                            className="reply-button"
                            onClick={() => handleReplySubmit(ticket._id, null)} // Default to no reply
                        >
                            Enviar respuesta
                        </button>

                        <button
                            className="delete-button"
                            onClick={() => handleDeleteTicket(ticket._id)}
                        >
                            Eliminar Ticket
                        </button>
                    </div>
                ))
            ) : (
                <p>No tickets found.</p>
            )}
        </div>
    );
};

export default TicketList;
