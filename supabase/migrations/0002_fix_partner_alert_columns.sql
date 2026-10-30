-- Fix partner_applications alert: the table columns are contact_name and independent_confirmed
-- (the function referenced NEW.name / NEW.independent, so the alert failed silently).
-- Applied to production 2026-10-30 as migration tc_fix_partner_alert_columns.
CREATE OR REPLACE FUNCTION public.tc_send_resend_alert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare
  v_cfg record;
  v_subject text;
  v_html text;
  v_text text;
  v_reply_to text;
  v_payload jsonb;
begin
  select * into v_cfg from public.tonnagecheck_alert_config where id = 1;
  if not found or v_cfg.resend_api_key is null or v_cfg.resend_api_key = '' then
    return NEW;
  end if;

  if TG_TABLE_NAME = 'installer_match_requests' then
    v_subject := format(
      '[TonnageCheck Lead] %s in ZIP %s (%s)',
      NEW.name,
      NEW.zip_code,
      coalesce('$' || NEW.quoted_amount_usd::text, 'No quote entered')
    );
    v_reply_to := NEW.email;
    v_text := format(
      E'New Homeowner Installer Match Request on TonnageCheck\n\n' ||
      'Name: %s\n' ||
      'Email: %s\n' ||
      'Phone: %s\n' ||
      'ZIP Code: %s\n' ||
      'Quoted Amount (USD): %s\n' ||
      'Quoted Brand / Model: %s\n' ||
      'Timeline: %s\n' ||
      'Notes: %s\n' ||
      'Submitted At: %s\n' ||
      'Lead ID: %s\n',
      NEW.name,
      NEW.email,
      coalesce(NEW.phone, '—'),
      NEW.zip_code,
      coalesce('$' || NEW.quoted_amount_usd::text, '—'),
      coalesce(NEW.quoted_brand_model, '—'),
      coalesce(NEW.timeline, '—'),
      coalesce(NEW.notes, '—'),
      NEW.created_at,
      NEW.id
    );
    v_html := format(
      '<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;line-height:1.5;color:#111">' ||
      '<h2 style="margin:0 0 12px;color:#d97706">New Homeowner Lead — TonnageCheck</h2>' ||
      '<table style="width:100%%;border-collapse:collapse;font-size:14px">' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Name</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Email</td><td style="padding:6px 8px;border-bottom:1px solid #eee"><a href="mailto:%s">%s</a></td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Phone</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">ZIP Code</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Quoted Amount</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Brand / Model</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Timeline</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Notes</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '</table>' ||
      '<p style="font-size:12px;color:#666;margin-top:14px">Lead ID: %s · %s</p></div>',
      NEW.name,
      NEW.email, NEW.email,
      coalesce(NEW.phone, '—'),
      NEW.zip_code,
      coalesce('$' || NEW.quoted_amount_usd::text, '—'),
      coalesce(NEW.quoted_brand_model, '—'),
      coalesce(NEW.timeline, '—'),
      coalesce(NEW.notes, '—'),
      NEW.id, NEW.created_at
    );

  elsif TG_TABLE_NAME = 'partner_applications' then
    v_subject := format(
      '[TonnageCheck Partner Signup] %s (%s — %s trucks)',
      NEW.company,
      NEW.contact_name,
      coalesce(NEW.trucks::text, '?')
    );
    v_reply_to := NEW.email;
    v_text := format(
      E'New Independent HVAC Partner Application on TonnageCheck\n\n' ||
      'Company: %s\n' ||
      'Contact Name: %s\n' ||
      'Email: %s\n' ||
      'Phone: %s\n' ||
      'State License #: %s\n' ||
      'Active Trucks: %s\n' ||
      'Independent Ownership Confirmed: %s\n' ||
      'Service ZIPs / Counties: %s\n' ||
      'Brands & Install Philosophy: %s\n' ||
      'Submitted At: %s\n' ||
      'Application ID: %s\n',
      NEW.company,
      NEW.contact_name,
      NEW.email,
      NEW.phone,
      NEW.license,
      coalesce(NEW.trucks::text, '—'),
      case when NEW.independent_confirmed then 'Yes' else 'No' end,
      NEW.service_zips,
      coalesce(NEW.about, '—'),
      NEW.created_at,
      NEW.id
    );
    v_html := format(
      '<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;line-height:1.5;color:#111">' ||
      '<h2 style="margin:0 0 12px;color:#059669">New Independent Installer Partner Application</h2>' ||
      '<table style="width:100%%;border-collapse:collapse;font-size:14px">' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Company</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Contact</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Email</td><td style="padding:6px 8px;border-bottom:1px solid #eee"><a href="mailto:%s">%s</a></td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Phone</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">State License #</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Active Trucks</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Independent</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">Service Area</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">About</td><td style="padding:6px 8px;border-bottom:1px solid #eee">%s</td></tr>' ||
      '</table>' ||
      '<p style="font-size:12px;color:#666;margin-top:14px">Application ID: %s · %s</p></div>',
      NEW.company,
      NEW.contact_name,
      NEW.email, NEW.email,
      NEW.phone,
      NEW.license,
      coalesce(NEW.trucks::text, '—'),
      case when NEW.independent_confirmed then 'Yes (100%% independent)' else 'No' end,
      NEW.service_zips,
      coalesce(NEW.about, '—'),
      NEW.id, NEW.created_at
    );

  elsif TG_TABLE_NAME = 'newsletter_subscribers' then
    v_subject := format('[TonnageCheck Newsletter] New subscriber: %s', NEW.email);
    v_reply_to := NEW.email;
    v_text := format(
      E'New TonnageCheck Weekly Newsletter Subscriber\n\nEmail: %s\nSource: %s\nSubscribed At: %s\nSubscriber ID: %s\n',
      NEW.email,
      coalesce(NEW.source, 'site'),
      NEW.created_at,
      NEW.id
    );
    v_html := format(
      '<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;line-height:1.5;color:#111">' ||
      '<h2 style="margin:0 0 12px;color:#2563eb">New TonnageCheck Newsletter Subscriber</h2>' ||
      '<p style="font-size:14px"><strong>Email:</strong> %s<br><strong>Source:</strong> %s<br><strong>Time:</strong> %s</p></div>',
      NEW.email,
      coalesce(NEW.source, 'site'),
      NEW.created_at
    );
  else
    return NEW;
  end if;

  v_payload := jsonb_build_object(
    'from', v_cfg.from_email,
    'to', to_jsonb(v_cfg.to_emails),
    'reply_to', v_reply_to,
    'subject', v_subject,
    'text', v_text,
    'html', v_html
  );

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    body := v_payload,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_cfg.resend_api_key,
      'Content-Type', 'application/json',
      'Idempotency-Key', TG_TABLE_NAME || '/' || NEW.id::text
    )
  );

  return NEW;
exception when others then
  -- Never block lead capture if async notification encounters an unexpected error
  return NEW;
end;
$function$
;
;
