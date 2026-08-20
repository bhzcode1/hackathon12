# Demo Scenarios for Crime Reporting Backend

This guide walks through four demo scenarios that showcase the key features of the Crime Reporting Backend API. Each scenario describes a sequence of API calls that would be made by a frontend application (or a demonstrator using tools like curl or Postman) to accomplish a specific goal.

## Scenario 1: User Reports a Theft

**Goal**: A citizen reports a theft incident via the mobile app or website.

### Steps:
1. **User Authentication** (if not already logged in)
   - POST `/api/v1/auth/login/access-token`
   - Body: `username=user_citizen@example.com&password=securepassword`
   - Response: Returns an access token

2. **Submit Crime Report**
   - POST `/api/v1/reports/` (Note: This endpoint would be implemented in the crime reports module, which is being developed in another branch. For demonstration purposes, we assume this endpoint exists and follows the standard CRUD pattern.)
   - Headers: `Authorization: Bearer <access_token>`
   - Body:
     ```json
     {
       "title": "Theft of Smartphone",
       "description": "Someone snatched my phone from my hand while I was waiting for the bus near Elm Street and 5th Avenue.",
       "crime_type": "Theft",
       "severity": "MEDIUM",
       "latitude": 40.7505,
       "longitude": -73.9934,
       "address": "Corner of Elm St and 5th Ave, New York, NY",
       "is_anonymous": false
     }
     ```
   - Response: Returns the created crime report object with an ID (e.g., `id: 1024`)

3. **Upload Evidence** (Optional but recommended)
   - POST `/api/v1/reports/1024/upload`
   - Headers: `Authorization: Bearer <access_token>`
   - Body (multipart/form-data):
     - `file`: [screenshot_of_theft.jpg]
     - `crime_report_id`: 1024
     - `description`: "Screenshot from a nearby security camera showing the suspect"
   - Response: Returns the created evidence object

### Expected Outcome:
- The crime report is stored in the database with status "PENDING" by default.
- The report appears in the victim's list of reports.
- Administrators can see the new report in their verification queue.

---

## Scenario 2: Admin Verifies a Report

**Goal**: A police administrator verifies a reported incident and updates its status.

### Steps:
1. **Admin Authentication**
   - POST `/api/v1/auth/login/access-token`
   - Body: `username=admin@police.gov&password=adminpassword`
   - Response: Returns an access token

2. **View Pending Reports**
   - GET `/api/v1/dashboard/recent-reports?limit=10`
   - Headers: `Authorization: Bearer <access_token>`
   - Response: List of recent reports, filter for those with status "PENDING"

3. **Verify a Specific Report**
   - Assume we want to verify report ID 1024 from Scenario 1
   - PUT `/api/v1/reports/1024` (Note: This endpoint would be in the crime reports module)
   - Headers: `Authorization: Bearer <access_token>`
   - Body:
     ```json
     {
       "status": "VERIFIED"
     }
     ```
   - Response: Returns the updated report object

4. **Check Dashboard Stats**
   - GET `/api/v1/dashboard/stats`
   - Headers: `Authorization: Bearer <access_token>`
   - Response: Shows updated counts (e.g., one less pending, one more verified)

### Expected Outcome:
- The report status changes from "PENDING" to "VERIFIED".
- The report now appears in verified crime statistics.
- The reporting user may receive a notification (if notification system is implemented).

---

## Scenario 3: Map Shows Hotspot

**Goal**: A city planner views the crime hotspot map to identify areas needing increased patrols.

### Steps:
1. **Authentication** (optional for public hotspot map, but we'll assume authenticated for this demo)
   - POST `/api/v1/auth/login/access-token`
   - Body: `username=cityplanner@example.com&password=plannerpass`
   - Response: Returns an access token

2. **Retrieve Hotspot Data**
   - GET `/api/v1/reports/heatmap?precision=3`
   - Headers: `Authorization: Bearer <access_token>`
   - Response: Array of objects, each containing:
     ```json
     {
       "latitude": 40.7505,
       "longitude": -73.9934,
       "weight": 15
     }
     ```
     Where `weight` is the number of reports in that geographic area (rounded to 3 decimal places).

3. **Display on Map**
   - The frontend application would plot these points on a map, using the `weight` value to determine the size or color intensity of each hotspot marker.
   - Areas with higher `weight` values indicate higher concentrations of reported incidents.

### Expected Outcome:
- The map visualizes crime concentrations, helping officials allocate resources effectively.
- In this demo, the hotspot around Elm Street and 5th Avenue would show an elevated weight due to the theft report from Scenario 1.

---

## Scenario 4: AI Classifies Crime and Detects Duplicates

**Goal**: The AI assistant helps officers by classifying crime types and detecting potential duplicate reports.

### Steps:
1. **Officer Authentication**
   - POST `/api/v1/auth/login/access-token`
   - Body: `username=officer@example.com&password=officerpass`
   - Response: Returns an access token

2. **Classify Crime Type from Description** (Note: This would be part of an AI classification module, which may be implemented separately. For this demo, we focus on duplicate detection as implemented.)
   - *Alternatively, skip to duplicate detection as that's the implemented AI feature.*

3. **Check for Duplicate Report**
   - An officer is about to file a report for a stolen wallet at the train station and wants to check if it's a duplicate.
   - POST `/api/v1/ai/detect-duplicate`
   - Headers: `Authorization: Bearer <access_token>`
   - Body:
     ```json
     {
       "description": "My wallet was stolen while I was on the subway train near Times Square.",
       "latitude": 40.7580,
       "longitude": -73.9855
     }
     ```
   - Response:
     ```json
     {
       "is_duplicate": true,
       "similarity_score": 0.82,
       "matched_report_id": 205
     }
     ```
   - Interpretation: The system found an 82% similarity match with report ID 205 (likely a similar theft report from the seed data).

4. **View the Matched Report**
   - GET `/api/v1/reports/205` (Note: This endpoint would be in the crime reports module)
   - Headers: `Authorization: Bearer <access_token>`
   - Response: Returns the details of report ID 205, allowing the officer to see if it's indeed the same incident.

### Expected Outcome:
- The officer avoids creating a duplicate report.
- Instead, they can add additional details or evidence to the existing report (ID 205) if appropriate.
- The AI system helps maintain data quality and reduces workload.

---

## Running the Demos

To run these scenarios against a live backend:

1. **Start the API**:
   ```bash
   uvicorn app.main:app --reload
   ```

2. **Generate Seed Data** (if not already done):
   ```bash
   python seed.py
   ```

3. **Follow the Steps**:
   - Use the API calls described in each scenario, adjusting credentials and data as needed.
   - For endpoints that depend on the crime reports module (which is being developed in another branch), you can simulate the expected behavior or wait for that module to be merged.

4. **Observe the Results**:
   - Check the database directly or use the dashboard endpoints to verify changes.
   - Use the heatmap and analytics endpoints to see the aggregated effects of the reported incidents.

## Notes on Implementation Status

- **Authentication**: Fully implemented (login, register, protected endpoints).
- **Users**: Full CRUD implemented.
- **Evidence Upload**: Fully implemented (upload, list, retrieve, delete).
- **Dashboard**: Fully implemented (stats, crime types, recent reports, hotspots).
- **Heatmap**: Fully implemented (reports/heatmap endpoint).
- **Analytics**: Fully implemented (crime trends, severity distribution, status distribution).
- **AI Duplicate Detection**: Fully implemented (ai/detect-duplicate endpoint).
- **Crime Reports Module**: According to the instructions, this is being implemented in another branch/session. Therefore, endpoints for creating, updating, and deleting crime reports directly (e.g., POST /reports/, PUT /reports/{id}) are not yet available in this codebase. However, the dashboard, heatmap, analytics, and evidence endpoints all read from the crime_reports table, so seeding data via `seed.py` allows those features to be demonstrated.

## Conclusion

These scenarios demonstrate how the Crime Reporting Backend supports the end-to-end workflow of incident reporting, verification, analysis, and intelligent assistance. By combining secure authentication, robust data modeling, and intelligent features like duplicate detection, the system provides a powerful tool for law enforcement and community safety initiatives.

*Last updated: August 20, 2026*