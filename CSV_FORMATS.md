# CSV Data Formats for Bedside App

This document describes the expected CSV formats for the Bedside App's Google Sheets integration.

## Care Log CSV Format

The care log should be a Google Sheet with the following columns:

| Column Name | Description | Required | Example |
|-------------|-------------|----------|---------|
| `Timestamp` | Date and time of the entry | Yes | `1/15/2024 14:30:00` |
| `Event` | Description of what happened | Yes | `Patient had a good morning. Ate breakfast well and participated in physical therapy.` |
| `Name` | Name of the person making the entry | Yes | `Nurse Mary` |

### Example Care Log CSV:
```csv
Timestamp,Event,Name
1/15/2024 14:30:00,Patient had a good morning. Ate breakfast well and participated in physical therapy.,Nurse Mary
1/15/2024 10:15:00,Routine check-up completed. Vital signs are stable. Continue current medication.,Dr. Smith
1/14/2024 18:45:00,Visited Mom today. She was in great spirits and enjoyed the flowers I brought.,Daughter Sue
```

## Contacts CSV Format (Optional)

If you want to use a custom contacts list instead of the default ones, create a Google Sheet with these columns:

| Column Name | Description | Required | Example |
|-------------|-------------|----------|---------|
| `Name` | Contact display name | Yes | `Dr. Smith` |
| `Phone` | Phone number or email for contact | Yes | `+15551234567` or `john@example.com` |
| `Type` | Contact type: `tel` or `facetime` | Yes | `tel` |
| `Icon` | Emoji icon to display | No | `👨‍⚕️` |

### Example Contacts CSV:
```csv
Name,Phone,Type,Icon
Dr. Smith,+15551234567,tel,👨‍⚕️
Nurse Mary,+15551234568,tel,👩‍⚕️
Son John,+15551234569,tel,👨
FaceTime John,john@example.com,facetime,📹
Emergency,911,tel,🚨
```

## How to Set Up Google Sheets CSV

1. **Create your Google Sheet** with the appropriate column headers
2. **Add your data** following the format above
3. **Publish to web**:
   - Go to `File → Share → Publish to web`
   - Choose `Comma-separated values (.csv)` format
   - Select the specific sheet tab if you have multiple tabs
   - Click `Publish`
4. **Copy the CSV URL** that Google provides
5. **Paste the URL** into the Bedside App settings

### Important Notes:
- The CSV URL should look like: `https://docs.google.com/spreadsheets/d/e/[SHEET_ID]/pub?output=csv`
- Make sure the sheet is published publicly (no sign-in required)
- Data updates in Google Sheets will automatically appear in the app
- Column names are case-sensitive and must match exactly
- Timestamps can be in various formats but `M/D/YYYY H:MM:SS` works best

## Contact Types

### Phone Contacts (`tel`)
- Use format: `tel:+15551234567`
- Will open the device's phone app
- Good for: Doctors, nurses, family members, facilities

### FaceTime Contacts (`facetime`) 
- Use format: `facetime:email@example.com`
- Will open FaceTime on iOS devices
- Good for: Video calls with family members

### Emergency Contacts
- Any contact named "Emergency" gets special red styling
- Typically use `911` or local emergency number

## Troubleshooting

- **"No care log entries found"**: Check that your CSV has the exact column names: `Timestamp`, `Event`, `Name`
- **"Error loading care log"**: Verify the CSV URL is published publicly and accessible
- **Dates not formatting correctly**: Use `M/D/YYYY H:MM:SS` format for timestamps
- **Contacts not loading**: Ensure CSV has `Name`, `Phone`, `Type` columns (Icon is optional)