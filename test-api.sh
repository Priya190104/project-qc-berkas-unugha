#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${YELLOW}=== QC Berkas System Testing ===${NC}\n"

# 1. Login Test
echo -e "${YELLOW}1. Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@qc.com",
    "password": "password"
  }')

echo "Response: $LOGIN_RESPONSE"
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo -e "Token: $TOKEN\n"

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed!${NC}\n"
  exit 1
fi

echo -e "${GREEN}✓ Login successful!${NC}\n"

# 2. Test Get Petugas
echo -e "${YELLOW}2. Testing GET /api/petugas...${NC}"
PETUGAS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/petugas" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $PETUGAS_RESPONSE"
echo -e ""

# 3. Test Add Petugas
echo -e "${YELLOW}3. Testing POST /api/petugas (Add Petugas Koordinator)...${NC}"
ADD_PETUGAS=$(curl -s -X POST "$BASE_URL/api/petugas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Budi Santoso",
    "tipe": "KOORDINATOR_UKUR"
  }')

echo "Response: $ADD_PETUGAS"
echo -e ""

# 4. Test Get Petugas Again
echo -e "${YELLOW}4. Testing GET /api/petugas (After adding)...${NC}"
PETUGAS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/petugas" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $PETUGAS_RESPONSE"
echo -e ""

# 5. Test Create Berkas
echo -e "${YELLOW}5. Testing POST /api/berkas/create...${NC}"
CREATE_BERKAS=$(curl -s -X POST "$BASE_URL/api/berkas/create" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "noBerkas": "TEST-001",
    "namaPemohon": "John Doe",
    "jenisPermohonan": "Ukur PIB",
    "koordinatorUkur": "Budi Santoso",
    "petugasUkur": null,
    "petugasPemetaan": null
  }')

echo "Response: $CREATE_BERKAS"
echo -e ""

# 6. Test Logout
echo -e "${YELLOW}6. Testing POST /api/auth/logout...${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $LOGOUT_RESPONSE"
echo -e ""

echo -e "${GREEN}=== All Tests Completed ===${NC}"
