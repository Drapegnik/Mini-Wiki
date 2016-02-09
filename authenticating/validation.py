from django.shortcuts import redirect


def require_email(strategy, details, user=None, is_new=False, *args, **kwargs):
    backend = kwargs.get('backend')
    if user and user.email:
        return
    elif is_new and not details.get('email'):
        userEmail = strategy.request_data().get('email')
        if userEmail:
            details['email'] = userEmail
        else:
            return redirect('acquire_email')
