({
    invoke : function(component, event, helper) {
        // Get the URL from Flow
        var targetUrl = component.get("v.targetUrl");

        // Validate URL
        if (targetUrl && targetUrl.startsWith("https")) {
            // Navigate to the given URL
            window.location.href = targetUrl;
        } else {
            console.error("❌ Invalid URL: " + targetUrl);
        }
    }
})
