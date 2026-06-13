# AI Chatbot Module - Setup & Implementation Guide

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+
- MySQL/MariaDB database
- Existing ACME project setup

### Step 1: Backend Setup

#### 1.1 Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

The updated `requirements.txt` includes:

- `transformers`: Hugging Face transformer models
- `torch`: PyTorch deep learning framework

#### 1.2 Apply Database Migrations

```bash
cd backend
alembic upgrade head
```

This creates two new tables:

- `chatbot_conversations`: Stores conversation metadata
- `chatbot_messages`: Stores individual messages

#### 1.3 Verify Backend Integration

The chatbot API is automatically registered when the app starts. Verify with:

```bash
curl http://localhost:8000/docs
```

Look for `/students/chatbot/*` endpoints in the Swagger documentation.

#### 1.4 Start Backend Server

```bash
cd backend
python -m uvicorn app.main:app --reload
```

Expected output:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 2: Frontend Setup

#### 2.1 Verify Component Integration

The `StudentChatbot` component is already integrated into `StudentLayout.tsx`.

#### 2.2 Start Frontend Development Server

```bash
npm run dev
```

Expected output:

```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

#### 2.3 Access the Application

1. Navigate to http://localhost:5173
2. Login as a student
3. You should see a floating chatbot button in the bottom-right corner

### Step 3: Test the Chatbot

#### 3.1 Basic Functionality Test

1. Click the floating chatbot button (red circle with message icon)
2. The chat window should expand
3. Type a test message: "Hello"
4. You should see:
   - Your message in the chat
   - A response from the AI assistant
   - Proper message styling (your message on right, bot on left)

#### 3.2 Conversation Management

1. Click the "+" button in the chat header
2. View conversation list
3. Click "New Chat" to start a new conversation
4. Create multiple conversations by sending different messages
5. Switch between conversations
6. Delete a conversation using the trash icon

#### 3.3 API Testing with cURL

```bash
# Get your JWT token first (via login API)
TOKEN="your_jwt_token_here"

# Create a conversation
curl -X POST http://localhost:8000/students/chatbot/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Send a message
curl -X POST http://localhost:8000/students/chatbot/conversations/1/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is my grade?"}'

# List conversations
curl -X GET "http://localhost:8000/students/chatbot/conversations?skip=0&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Get a specific conversation
curl -X GET http://localhost:8000/students/chatbot/conversations/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Configuration

### AI Provider Selection

Set the AI provider via environment variable:

```bash
# .env file or export
export AI_PROVIDER=mock           # Rule-based (fastest, no ML)
export AI_PROVIDER=huggingface    # Transformer model (default)
```

### Database Configuration

The chatbot uses the existing database configuration from `.env`:

```bash
DATABASE_URL=mysql+pymysql://user:password@localhost/acme_db
```

### API Base URL

Frontend uses the `VITE_API_BASE` environment variable:

```bash
# .env file (frontend)
VITE_API_BASE=http://127.0.0.1:8000
```

## File Structure

```
ACME/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── chatbot.py                    # API endpoints
│   │   ├── crud/
│   │   │   └── chatbot.py                    # Database operations
│   │   ├── models/
│   │   │   ├── chatbot.py                    # SQLAlchemy models
│   │   │   ├── student.py                    # Updated with chatbot relationship
│   │   │   └── __init__.py                   # Updated imports
│   │   ├── schemas/
│   │   │   └── chatbot.py                    # Pydantic schemas
│   │   ├── services/
│   │   │   └── chatbot_service.py            # Business logic & AI
│   │   └── main.py                           # Updated with chatbot router
│   ├── alembic/
│   │   └── versions/
│   │       └── 001_add_chatbot_tables.py    # Migration
│   └── requirements.txt                      # Updated dependencies
│
└── src/
    └── src/
        ├── components/
        │   └── StudentChatbot.tsx            # Chatbot UI component
        ├── services/
        │   └── chatbotService.ts             # API service
        └── layouts/
            └── StudentLayout.tsx              # Updated with chatbot
```

## API Endpoints Reference

### Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

### Create Conversation

```
POST /students/chatbot/conversations
```

### List Conversations

```
GET /students/chatbot/conversations?skip=0&limit=100
```

### Get Conversation

```
GET /students/chatbot/conversations/{id}
```

### Send Message

```
POST /students/chatbot/conversations/{id}/messages
Body: {"message": "Your message"}
```

### Send Message (New Conversation)

```
POST /students/chatbot/conversations/messages/new
Body: {"message": "Your message"}
```

### Update Conversation Title

```
PUT /students/chatbot/conversations/{id}?title=New Title
```

### Delete Conversation

```
DELETE /students/chatbot/conversations/{id}
```

## Key Features

### ✅ Implemented

- [x] Floating chatbot button (always accessible)
- [x] Real-time messaging
- [x] Conversation history
- [x] Multiple conversations support
- [x] Message persistence (database)
- [x] AI-powered responses
- [x] Mobile-responsive design
- [x] Error handling
- [x] Loading indicators
- [x] Smooth animations
- [x] Role-based access control
- [x] Auto-scrolling to latest messages

### 🎯 Ready for Enhancement

- [ ] Advanced AI models (OpenAI API, Claude, Gemini)
- [ ] Context-aware responses (student data integration)
- [ ] Voice input/output
- [ ] Conversation search
- [ ] Message reactions/ratings
- [ ] Admin conversation monitoring
- [ ] Conversation analytics
- [ ] Multi-language support
- [ ] Rate limiting
- [ ] Conversation export

## Troubleshooting

### Backend Issues

#### Issue: Migration fails

```
ERROR: Cannot add foreign key constraint
```

**Solution**: Ensure students table exists. Run all migrations:

```bash
alembic current    # Check current migration
alembic upgrade head
```

#### Issue: Module not found error

```
ModuleNotFoundError: No module named 'app.crud.chatbot'
```

**Solution**: Restart the backend server for import changes to take effect.

#### Issue: AI Model download fails

```
Failed to load model from transformers
```

**Solution**:

- Use `AI_PROVIDER=mock` to skip model download
- Or ensure internet connection for model download

### Frontend Issues

#### Issue: Chatbot button not visible

```
Solution: Verify StudentLayout.tsx includes StudentChatbot component
```

#### Issue: API connection errors

```
Failed to fetch http://localhost:8000
```

**Solution**:

- Verify backend is running on correct port
- Check VITE_API_BASE is correctly set
- Check CORS settings in backend

#### Issue: Messages not sending

```
Solution: Check browser console for specific error messages
```

### Database Issues

#### Issue: Duplicate migration names

```
Solution: Ensure migration file names are unique
```

#### Issue: Foreign key constraint errors

```
Solution: Verify student_id references existing student in students table
```

## Performance Optimization

### Backend

1. **Database Indexing**: Conversation and message tables are indexed on student_id and timestamps
2. **Pagination**: Conversation lists support pagination to reduce memory usage
3. **Lazy Loading**: Messages are only fetched when conversation is opened
4. **Async Processing**: API uses async/await for non-blocking operations

### Frontend

1. **Code Splitting**: StudentChatbot component is lazily loaded
2. **Memoization**: Components use React.memo for optimization
3. **State Management**: Minimal re-renders with useState
4. **Smooth Scrolling**: Auto-scroll uses native browser behavior

## Security Best Practices

1. **JWT Token Validation**: All endpoints validate JWT tokens
2. **Student Isolation**: Students can only access their own conversations
3. **SQL Injection Prevention**: Using ORM (SQLAlchemy) for all queries
4. **CORS Protection**: Configured CORS headers in FastAPI
5. **Input Sanitization**: Messages are validated before storage

## Monitoring & Debugging

### Enable Debug Logging

```python
# In backend app/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Monitor API Requests

```bash
# Terminal 1: Backend logs
tail -f backend/debug.log

# Terminal 2: Frontend network requests
# Use browser DevTools → Network tab
```

### Database Queries

```bash
# MySQL shell
mysql -u user -p database_name
SELECT * FROM chatbot_conversations;
SELECT * FROM chatbot_messages;
```

## Support & Additional Resources

- **Backend Logs**: Check terminal output for detailed error messages
- **Frontend Console**: Browser DevTools (F12) → Console tab
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Database Logs**: Check MySQL error log

## Next Steps

1. Test the chatbot thoroughly
2. Integrate advanced AI models (OpenAI, Claude)
3. Add analytics dashboard
4. Implement conversation search
5. Add voice capabilities
6. Deploy to production

---

For questions or issues, refer to the main [AI_CHATBOT_MODULE_DOCUMENTATION.md](AI_CHATBOT_MODULE_DOCUMENTATION.md)
