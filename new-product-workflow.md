# New Product Workflow Lifecycle

This document outlines the end-to-end lifecycle of creating a product in Kabak AI, from user input to final persistence.

## 1. User Input & Draft Persistence
- **Page**: `/new-product` (`new_product_page.tsx`)
- **Component**: `F_Product_Form`
- **Actions**:
  - User Uploads Front/Back Images -> Immediately saved to `localStorage` (Base64) to prevent data loss on refresh.
  - User fills details (Gender, Age, etc.) -> Saved to `cookies` (Preferences) for smart defaults.
- **Submission**:
  - Validates inputs.
  - Constructs `I_Product_Data` payload with `status: 'running'`.
  - Saves to **IndexedDB**.
  - Clears `localStorage` draft images via `F_Clear_Draft` logic.

## 2. Job Manager (Polling & Processing)
- **Component**: `F_Job_Provider` (`job_manager.tsx`)
- **Mechanism**: `setInterval` (5s) checks IndexedDB for products with `status: 'running'`.
- **Guards**:
  - **Timeout**: Checks if `Date.now() - created_at > 5 mins`. If yes, marks as `exited`.
  - **Retries**: If `retry_count >= 3`, marks as `exited`.

### Sequential Pipeline
The AI generation occurs in two distinct stages:

#### Stage 1: Text Generation (Gemini 2.0)
- **Check**: If `product_title` or `product_desc` is missing.
- **Action**: Calls `F_Generate_SEO_Content`.
- **Output**: Updates product with Title, Description, Tags.
- **Status**: Remains `running`.

#### Stage 2: Visual Generation (Gemini 3.0)
- **Check**: If `model_front` is missing (and Text is done).
- **Action**: 
  - Log "Generating Image...".
  - Calls `F_Generate_Model_Image`.
  - **Isolation Test**: Uses hardcoded prompt for consistency.
- **Output**: Updates `model_front` with Base64 image.
- **Status**: Updates to `finished`.

## 3. Finalization & UI Updates
- **IndexedDB**: The `finished` product is updated in the database.
- **UI**: 
  - `useLiveQuery` (via `hooks`) or Polling automatically updates the Collection View.
  - Product Card removes "Processing" overlay and shows result.
- **Analytics**: Usage cost is tracked via `F_Track_Usage` and updates the Dashboard.

## 4. Cleanup
- **Cancellation**: User can click "X" on a running job card to cancel (`status: 'exited'`).
- **Error Handling**: Failed jobs show error logs in the UI/Console.
