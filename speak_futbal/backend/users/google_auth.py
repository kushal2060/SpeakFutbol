from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from allauth.socialaccount.models import SocialAccount
from django.contrib.auth import get_user_model, login
import requests
from rest_framework.authtoken.models import Token

User = get_user_model()

class GoogleLoginView(APIView):
    permission_classes = []
    
    def post(self, request):
        access_token = request.data.get('access_token')
        
        if not access_token:
            return Response(
                {'error': 'access_token is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify token with Google
            google_response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            
            if google_response.status_code != 200:
                return Response(
                    {'error': 'Invalid access token'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user_info = google_response.json()
            email = user_info.get('email')
            google_id = user_info.get('sub')
            
            if not email or not google_id:
                return Response(
                    {'error': 'Could not get user info from Google'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user exists via social account
            try:
                social_account = SocialAccount.objects.get(
                    provider='google',
                    uid=google_id
                )
                user = social_account.user
            except SocialAccount.DoesNotExist:
                # Create new user
                username = email.split('@')[0]
                # Ensure unique username
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=user_info.get('given_name', ''),
                    last_name=user_info.get('family_name', '')
                )
                
                # Create social account
                social_account = SocialAccount.objects.create(
                    user=user,
                    provider='google',
                    uid=google_id,
                    extra_data=user_info
                )
            
            # Log the user in (creates session)
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            
            # Get or create token
            token, _ = Token.objects.get_or_create(user=user)
            
            # Return token and user data
            from users.serializers import UserSerializer
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )