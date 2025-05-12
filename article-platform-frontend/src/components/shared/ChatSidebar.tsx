    // File: src/components/shared/ChatSidebar.tsx
    import React, { useState, useEffect, type FormEvent, useRef } from 'react';
    import Offcanvas from 'react-bootstrap/Offcanvas';
    import Form from 'react-bootstrap/Form';
    import Button from 'react-bootstrap/Button';
    import ListGroup from 'react-bootstrap/ListGroup';
    import InputGroup from 'react-bootstrap/InputGroup';
    import Badge from 'react-bootstrap/Badge';
    import Card from 'react-bootstrap/Card';
    import { ChatDots, SendFill } from 'react-bootstrap-icons';
    import { useSocket } from '../../contexts/SocketContext'; // Adjust path
    import { useAuth } from '../../contexts/AuthContext'; // Adjust path
    import './ChatSidebar.css'; // Import custom CSS

    interface ChatMessageData {
      id?: string;
      senderId: string;
      senderName: string;
      message: string;
      timestamp: Date | string;
      room?: string;
      isOwnMessage?: boolean;
    }

    interface ChatSidebarProps {
      show: boolean;
      handleClose: () => void;
    }

    const ChatSidebar: React.FC<ChatSidebarProps> = ({ show, handleClose }) => {
      const { socket, isConnected } = useSocket();
      const { user: currentUser } = useAuth();
      const [messages, setMessages] = useState<ChatMessageData[]>([]);
      const [newMessage, setNewMessage] = useState('');
      const messagesEndRef = useRef<null | HTMLDivElement>(null);

      useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [messages]);

      useEffect(() => {
        if (socket) {
          const messageListener = (message: ChatMessageData) => {
            setMessages((prevMessages) => [
              ...prevMessages,
              { ...message, isOwnMessage: message.senderId === (currentUser?.id || socket.id) }
            ]);
          };
          socket.on('newMessage', messageListener);
          socket.on('joinedRoomAck', (data) => {
            setMessages(prev => [...prev, {
                senderId: 'system', senderName: 'System',
                message: `You joined ${data.room}.`, timestamp: new Date(), isOwnMessage: false
            }]);
          });
          return () => {
            socket.off('newMessage', messageListener);
            socket.off('joinedRoomAck');
          };
        }
      }, [socket, currentUser]);

      const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (newMessage.trim() && socket && isConnected) {
          const messagePayload = { message: newMessage.trim() };
          socket.emit('sendMessage', messagePayload);
          setNewMessage('');
        } else if (!isConnected) {
            console.warn("Socket not connected.");
        }
      };

      return (
        <Offcanvas
          show={show}
          onHide={handleClose}
          placement="end"
          scroll={true}
          backdrop={true}
          className="chat-sidebar-transparent p-4" 
          style={{width: '450px', border: 'none'}}
        >
          {/* Wrapper div to vertically and horizontally center the card - this might prevent full height if not adjusted */}
          {/* For full height card within offcanvas padding, the centering div might need to be h-100 too, or card directly in offcanvas body */}
          <div className="d-flex align-items-stretch justify-content-center h-100"> {/* Changed align-items-center to align-items-stretch */}
            <Card
              className="shadow-lg rounded-5 d-flex flex-column" 
              style={{
                  width: '100%', // Card takes full width of its centering container
                  height: '100%', // Card takes full height of its centering container (which is h-100)
                  border: 'none' // Ensure card border is invisible
              }}
            >
              <Card.Header className="d-flex justify-content-between align-items-center bg-light border-bottom rounded-5">
                <Offcanvas.Title className="d-flex align-items-center h5 mb-0">
                  <ChatDots size={22} className="me-2" /> Live Chat
                  {isConnected ? <Badge bg="success-subtle" text="success" className="ms-2 border border-success-subtle small">Online</Badge> : <Badge bg="danger-subtle" text="danger" className="ms-2 border border-danger-subtle small">Offline</Badge>}
                </Offcanvas.Title>
                <Button variant="close" onClick={handleClose} aria-label="Close" />
              </Card.Header>
              <Card.Body className="d-flex flex-column p-0 overflow-hidden rounded-5">
                <ListGroup variant="flush" className="flex-grow-1 overflow-auto p-3">
                  {messages.map((msg, index) => (
                    <ListGroup.Item
                      key={msg.id || index}
                      className={`d-flex flex-column ${msg.isOwnMessage ? 'align-items-end ms-auto' : 'align-items-start me-auto'} mb-2`}
                      style={{ border: 'none', maxWidth: '80%' }}
                    >
                      <div
                        className={`px-3 py-2 rounded-3 ${
                          msg.isOwnMessage
                            ? 'bg-primary text-white'
                            : msg.senderId === 'system'
                            ? 'bg-light text-muted fst-italic w-100 text-center py-1'
                            : 'bg-secondary text-white'
                        }`}
                        style={{wordBreak: 'break-word'}}
                      >
                        {msg.senderId !== 'system' && !msg.isOwnMessage && (
                            <small className="fw-bold d-block mb-1">{msg.senderName}</small>
                        )}
                        {msg.message}
                        <small className={`d-block mt-1 opacity-75`} style={{fontSize: '0.7rem'}}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>
                    </ListGroup.Item>
                  ))}
                  <div ref={messagesEndRef} />
                </ListGroup>

                <Form onSubmit={handleSendMessage} className="p-3 border-top bg-light">
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={!isConnected}
                      aria-label="Chat message input"
                      className="border-0"
                    />
                    <Button variant="primary" type="submit" disabled={!isConnected || newMessage.trim() === ''} className="px-3">
                      <SendFill />
                    </Button>
                  </InputGroup>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Offcanvas>
      );
    };

    export default ChatSidebar;
    