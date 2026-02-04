# SILAIBOOK - Visual Project Workflow

This document provides comprehensive visual diagrams showcasing how the **SilaiBook** tailoring shop management system works end-to-end.

---

## 🏗️ System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend - React 19 + Vite"
        A[User Browser]
        B[Dashboard Page]
        C[Order Management]
        D[Cloth Inventory]
        E[Customer Management]
    end
    
    subgraph "API Layer - FastAPI"
        F[Auth Router]
        G[Orders Router]
        H[Cloth Stock Router]
        I[Customers Router]
        J[CORS & Auth Middleware]
    end
    
    subgraph "Core Business Logic"
        K[Stock Manager]
        L[Order Processor]
        M[Measurement Validator]
        N[Financial Calculator]
    end
    
    subgraph "Data Storage"
        O[("MongoDB - Store Data")]
        P[Static Asset Store]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    
    B -->|Fetch Stats| G
    C -->|Create/Update| G
    D -->|Manage Stock| H
    E -->|Manage Profiles| I
    
    G --> J
    H --> J
    I --> J
    J --> F
    
    J --> L
    J --> K
    
    L --> M
    L --> K
    L --> N
    
    L --> O
    K --> O
    N --> O
    I --> O
    P --> O
    
    style A fill:#4CAF50
    style O fill:#FF9800
    style P fill:#2196F3
    style J fill:#9C27B0
```

---

## 🧵 Order Creation Flow - Detailed

```mermaid
sequenceDiagram
    actor Staff
    participant UI as NewOrderModal
    participant API as FastAPI Server
    participant DB as MongoDB
    
    Staff->>UI: Input Customer & Measurements
    UI->>UI: Validate Form Data
    Staff->>UI: Add Cloth Items
    UI->>API: POST /orders/
    
    API->>API: Authenticate User (JWT)
    API->>DB: Find Customer (is_active=True)
    alt Customer Not Found
        DB-->>API: null
        API-->>UI: 404 Error
    else Customer Found
        API->>DB: Check Cloth Stock Availability
        loop For each cloth item
            DB->>API: Return Stock Details
            alt Insufficient Stock
                API-->>UI: 400 Error (Not enough cloth)
            end
        end
        
        API->>API: Generate Order # (ORD-YYYY-XXXX)
        API->>DB: Create Order Document
        API->>DB: Deduct Cloth Stock ($inc: {used_meters: +X})
        API->>DB: Log Cloth Usage (Stage: Order Created)
        
        DB-->>API: Success (Order ID)
        API-->>UI: Order Created Successfully
        UI-->>Staff: Show Success Details
    end
```

---

## 🔄 Order Lifecycle & Status Workflow

```mermaid
stateDiagram-v2
    [*] --> Received
    Received --> Cutting: Staff Action
    Cutting --> Stitching: Staff Action
    Stitching --> Finishing: Staff Action
    Finishing --> Ready: Mark Ready (Requires Stock Confirmation)
    Ready --> Delivered: Customer Pickup
    Delivered --> [*]
    
    state "Received" as Received
    state "Cutting" as Cutting
    state "Stitching" as Stitching
    state "Finishing" as Finishing
    state "Ready" as Ready
    state "Delivered" as Delivered
    
    note right of Ready
      Triggers final cloth usage log
      and sets ready_at timestamp
    end note
```

---

## 🗄️ Data Models & Relationships

```mermaid
erDiagram
    CUSTOMERS ||--o{ ORDERS : places
    CLOTH_STOCK ||--o{ CLOTH_USAGE : tracked_in
    ORDERS ||--|{ CLOTH_USAGE : consumes
    ORDERS ||--o{ PAYMENTS : generates
    EMPLOYEES ||--o{ ORDERS : processes
    
    CUSTOMERS {
        ObjectId _id
        string name
        string mobile
        object measurements
        boolean is_active
    }
    
    ORDERS {
        ObjectId _id
        string order_number
        string status
        object measurements_snapshot
        array cloth_used
        datetime delivery_date
        float price
        float advance_amount
    }
    
    CLOTH_STOCK {
        ObjectId _id
        string cloth_type
        string dealer_name
        float total_meters
        float used_meters
        float remaining_meters
    }
    
    CLOTH_USAGE {
        ObjectId _id
        ObjectId stock_id
        ObjectId order_id
        float used_meters
        string stage
        datetime used_at
    }
```

---

## 🎯 Component Interaction Map

```mermaid
graph LR
    subgraph "React Components"
        A["Router (App.tsx)"]
        B[Dashboard]
        C[OrderList]
        D[OrderDetails]
        E[AddOrderModal]
    end
    
    subgraph "API Routes"
        F["/orders"]
        G["/orders/{id}"]
        H["/orders/{id}/status"]
        I["/customers"]
        J["/cloth-stock"]
    end
    
    subgraph "Backend Services"
        K[orders.py]
        L[customers.py]
        M[cloth_stock.py]
    end
    
    A --> B
    A --> C
    C --> D
    C --> E
    
    B --> F
    C --> F
    D --> G
    D --> H
    E --> F
    E --> I
    E --> J
    
    F --> K
    G --> K
    H --> K
    I --> L
    J --> M
    
    style K fill:#FF5722
    style L fill:#FF5722
    style M fill:#FF5722
```

---

## ⚡ Request/Response Flow Examples

### Example 1: Creating an Order

```mermaid
graph LR
    A["Frontend Request:<br/>POST /orders/"] --> B[Auth Middleware]
    B --> C["Fetch Customer<br/>(Validate ID)"]
    C --> D["Check Cloth Stock<br/>(Ensure Quantities)"]
    D --> E["Generate ID<br/>ORD-2024-0042"]
    E --> F["Deduct Stock<br/>Update MongoDB"]
    F --> G["Log Usage<br/>Audit Trail"]
    G --> H["Return Response<br/>200 OK + Order #"]
    
    style H fill:#4CAF50
```

### Example 2: Marking Order as Ready

```mermaid
graph LR
    A["Frontend Request:<br/>POST /mark-ready"] --> B["Verify Status<br/>Must be 'Finishing'"]
    B --> C["Confirm Toggle<br/>Check 'confirm=true'"]
    C --> D["Log Final Usage<br/>Record 'Stage: Ready'"]
    D --> E["Update Status<br/>Set 'Ready'"]
    E --> F["Update Timestamps<br/>ready_at = Now"]
    F --> G["Return Success<br/>'Order marked Ready'"]
    
    style G fill:#2196F3
```

---

## 📊 Technology Stack

```mermaid
mindmap
  root((SILAIBOOK))
    Backend
      FastAPI
      Python 3.x
      Uvicorn
      Pydantic
    Database
      MongoDB
      PyMongo Driver
    Frontend
      React 19
      Vite 7.2
      TailwindCSS 4.1
      React Router 7
      Recharts
      Axios
    Security
      OAuth2 Password Flow
      JWT Tokens
      BCrypt Hashing
      CORSMiddleware
    DevOps
      Git GitHub
      Virtual Environment venv
      NPM / PIP
```

---

## 🎨 User Journey Map

### Customer/Staff Journey: Placing a Custom Order

```mermaid
journey
    title Process of Taking a New Tailoring Order
    section Reception
      Greet Customer: 5: Staff
      Discuss Design/Style: 4: Staff, Customer
    section Measurement
      Take Measurements: 5: Customer
      Input in App: 5: Staff
    section Material
      Check Cloth Stock: 3: Staff, System
      Confirm Fabric Choice: 5: Customer
    section Confirmation
      Calculate Price: 5: System
      Collect Advance: 5: Staff
      Generate Order Receipt: 5: System
```

### Staff Journey: Order Production

```mermaid
journey
    title Order Fulfillment Process
    section Preparation
      Check Task List: 5: Master
      Cut Fabric: 4: Master
      Mark as Cutting: 5: App
    section Assembly
      Stitch Garment: 3: Tailor
      Mark as Stitching: 5: App
    section Quality Check
      Finish & Iron: 5: Helper
      Check Measurements: 5: Master
      Mark Ready: 5: App
```

---

## 🔐 Security & Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant CORS
    participant Auth Check
    participant API
    
    User->>Frontend: Login (Username/Password)
    Frontend->>API: POST /auth/token
    API->>API: Validate Credentials (BCrypt)
    API-->>Frontend: Return Access Token (JWT)
    
    User->>Frontend: Access Protected Route
    Frontend->>Frontend: Attach Bearer Token
    Frontend->>API: Request Data
    
    API->>CORS: Validate Origin (localhost:5173)
    API->>Auth Check: Verify JWT Signature (HS256)
    
    alt Token Valid
        Auth Check->>API: Set current_user
        API-->>Frontend: JSON Response
    else Token Invalid/Expired
        Auth Check-->>Frontend: 401 Unauthorized
        Frontend-->>User: Redirect to Login
    end
```

---


