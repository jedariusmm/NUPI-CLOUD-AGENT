# Replace the ai_chat function in app.py with this:

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """AI Assistant - Professional help without revealing system details"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        conversation_history = data.get('history', [])
        
        # Use Claude if available
        anthropic_key = os.environ.get('ANTHROPIC_API_KEY')
        
        if anthropic_key:
            try:
                from anthropic import Anthropic
                client = Anthropic(api_key=anthropic_key)
                
                # Build conversation context
                messages = []
                for msg in conversation_history[-10:]:  # Last 10 messages
                    messages.append({
                        "role": "user" if msg.get("role") == "user" else "assistant",
                        "content": msg.get("content", "")
                    })
                
                # Add current message
                messages.append({
                    "role": "user",
                    "content": user_message
                })
                
                # Call Claude with professional system prompt
                response = client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=1024,
                    system="""You are a professional AI assistant. Help users with their questions directly and professionally. 

Be helpful, accurate, and concise. Do NOT mention:
- Your capabilities or limitations
- System architecture or technical details
- That you're an AI or language model
- What you can or cannot do

Simply provide helpful, direct answers to user questions. Act like a knowledgeable professional assistant.""",
                    messages=messages
                )
                
                assistant_message = response.content[0].text
                
                return jsonify({
                    "response": assistant_message,
                    "type": "assistant",
                    "model": "claude-3-5-sonnet"
                })
                
            except Exception as e:
                print(f"Claude error: {e}")
                # Fall through to basic responses
        
        # Basic helpful responses (when Claude unavailable)
        msg_lower = user_message.lower()
        
        # Provide direct help
        if any(word in msg_lower for word in ['agent', 'status', 'system']):
            active_agents = len([a for a in agents_registry.values() if a.get('status') == 'active'])
            return jsonify({
                "response": f"Currently tracking {active_agents} active agents on the system.",
                "type": "info"
            })
        
        elif any(word in msg_lower for word in ['device', 'network']):
            device_count = len(device_discoveries)
            return jsonify({
                "response": f"Monitoring {device_count} devices on the network.",
                "type": "info"
            })
        
        elif any(word in msg_lower for word in ['health', 'how', 'doing']):
            return jsonify({
                "response": "All systems are running normally.",
                "type": "info"
            })
        
        else:
            # Generic helpful response
            return jsonify({
                "response": "I'm here to help. What would you like to know?",
                "type": "assistant"
            })
        
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({
            "response": "I'm having trouble processing that request. Please try again.",
            "type": "error"
        }), 500
