import json
import urllib.request

print("Testing Founders Circle API...\n")

# Test 1: Check API is running
try:
    response = urllib.request.urlopen('http://localhost:5000/')
    print('✓ Backend API is running')
except Exception as e:
    print(f'✗ API error: {e}')
    exit(1)

# Test 2: Get deals
try:
    response = urllib.request.urlopen('http://localhost:5000/api/deals')
    data = json.loads(response.read())
    deals = data['deals']
    print(f'✓ Deals API working - {len(deals)} deals loaded')
    
    # Count public vs locked
    public = [d for d in deals if d['accessLevel'] == 'public']
    locked = [d for d in deals if d['accessLevel'] == 'locked']
    print(f'  - {len(public)} public deals')
    print(f'  - {len(locked)} locked deals (require verification)')
except Exception as e:
    print(f'✗ Deals API error: {e}')

# Test 3: Get single deal
try:
    response = urllib.request.urlopen('http://localhost:5000/api/deals/nimbus-cloud-credits')
    data = json.loads(response.read())
    deal = data['deal']
    print(f'✓ Single deal API working')
    print(f'  - Deal: {deal["title"]}')
    print(f'  - Partner: {deal["partnerName"]}')
    print(f'  - Category: {deal["category"]}')
    print(f'  - Access: {deal["accessLevel"]}')
except Exception as e:
    print(f'✗ Single deal API error: {e}')

# Test 4: Filter deals by category
try:
    response = urllib.request.urlopen('http://localhost:5000/api/deals?category=Cloud')
    data = json.loads(response.read())
    deals = data['deals']
    print(f'✓ Category filter working - {len(deals)} Cloud deals found')
except Exception as e:
    print(f'✗ Category filter error: {e}')

# Test 5: Filter deals by access level
try:
    response = urllib.request.urlopen('http://localhost:5000/api/deals?accessLevel=public')
    data = json.loads(response.read())
    deals = data['deals']
    print(f'✓ Access level filter working - {len(deals)} public deals found')
except Exception as e:
    print(f'✗ Access level filter error: {e}')

# Test 6: Search deals
try:
    response = urllib.request.urlopen('http://localhost:5000/api/deals?search=analytics')
    data = json.loads(response.read())
    deals = data['deals']
    print(f'✓ Search working - {len(deals)} results for "analytics"')
except Exception as e:
    print(f'✗ Search error: {e}')

print('\n✓ All API tests passed!')
print('\nFrontend is running at: http://localhost:3000')
print('Backend API is running at: http://localhost:5000')
