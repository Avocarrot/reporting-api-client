exports.UNAUTHORIZED = {
  "errors": [
    {
      "message": "Missing Authorization header from request"
    }
  ]
};

exports.TOTALS_DATA = {
  "query": {
    "filters": {
      "app_id": [],
      "app_name": [],
      "appstore_url": [],
      "category": [],
      "placement_type": [],
      "publisher_id": [],
      "country": [],
      "city": [],
      "carrier": [],
      "device_model": [],
      "connection_type": [],
      "os": [],
      "os_version": [],
      "has_lat_long": [],
      "is_video_enabled": [],
      "has_ifa": []
    },
    "granularity": "all",
    "timestamp": {
      "from": "2016-08-07T00:00:00.000Z",
      "to": "2016-07-19T13:17:00.000Z"
    },
    "group": []
  },
  "data": [
    {
      "timestamp": "2016-08-07T00:00:00.000Z",
      "dimensions": {
        "app_id": null,
        "app_name": null,
        "appstore_url": null,
        "category": null,
        "placement_type": null,
        "publisher_id": null,
        "country": null,
        "city": null,
        "carrier": null,
        "device_model": null,
        "connection_type": null,
        "os": null,
        "os_version": null,
        "has_lat_long": null,
        "is_video_enabled": null,
        "has_ifa": null
      },
      "result": {
        "auctions": 399522571,
        "ctr": 0.008512382938437556
      }
    }
  ],
  "meta": {
    "currency": "USD"
  }
};

exports.BREAKDOWN_DATA_SPLIT_1 = {
  "query": {
    "filters": {
      "app_id": [],
      "app_name": [],
      "appstore_url": [],
      "category": [],
      "placement_type": [],
      "publisher_id": [],
      "country": [],
      "city": [],
      "carrier": [],
      "device_model": [],
      "connection_type": [],
      "os": [],
      "os_version": [],
      "has_lat_long": [],
      "is_video_enabled": [],
      "has_ifa": []
    },
    "granularity": "all",
    "timestamp": {
      "from": "2016-08-22T00:00:00.000Z",
      "to": "2016-08-22T10:00:00.000Z"
    },
    "group": ["app_id"]
  },
  "data": [
    {
      "timestamp": "2016-08-22T00:00:00.000Z",
      "dimensions": {
        "app_id": "10001",
        "app_name": null,
        "appstore_url": null,
        "category": null,
        "placement_type": null,
        "publisher_id": null,
        "country": null,
        "city": null,
        "carrier": null,
        "device_model": null,
        "connection_type": null,
        "os": null,
        "os_version": null,
        "has_lat_long": null,
        "is_video_enabled": null,
        "has_ifa": null
      },
      "result": {
        "auctions": 2621,
        "ctr": 0.32188811188811189
      }
    }, {
      "timestamp": "2016-08-22T00:00:00.000Z",
      "dimensions": {
        "app_id": "10002",
        "app_name": null,
        "appstore_url": null,
        "category": null,
        "placement_type": null,
        "publisher_id": null,
        "country": null,
        "city": null,
        "carrier": null,
        "device_model": null,
        "connection_type": null,
        "os": null,
        "os_version": null,
        "has_lat_long": null,
        "is_video_enabled": null,
        "has_ifa": null
      },
      "result": {
        "auctions": 8121,
        "ctr": 0.32188811188811189
      }
    }
  ],
  "meta": {
    "currency": "USD"
  }
},

exports.BREAKDOWN_DATA_SPLIT_2 = {
  "query": {
    "filters": {
      "app_id": [
        "10001", "10002"
      ],
      "app_name": [],
      "appstore_url": [],
      "category": [],
      "placement_type": [],
      "publisher_id": [],
      "country": [],
      "city": [],
      "carrier": [],
      "device_model": [],
      "connection_type": [],
      "os": [],
      "os_version": [],
      "has_lat_long": [],
      "is_video_enabled": [],
      "has_ifa": []
    },
    "granularity": "all",
    "timestamp": {
      "from": "2016-08-22T00:00:00.000Z",
      "to": "2016-08-22T10:00:00.000Z"
    },
    "group": ["app_id", "placement_type"]
  },
  "data": [
    {
      "timestamp": "2016-08-22T00:00:00.000Z",
      "dimensions": {
        "app_id": "10001",
        "app_name": null,
        "appstore_url": null,
        "category": null,
        "placement_type": "INTE",
        "publisher_id": null,
        "country": null,
        "city": null,
        "carrier": null,
        "device_model": null,
        "connection_type": null,
        "os": null,
        "os_version": null,
        "has_lat_long": null,
        "is_video_enabled": null,
        "has_ifa": null
      },
      "result": {
        "auctions": 26121121,
        "ctr": 0.31188811188811189
      }
    }, {
      "timestamp": "2016-08-22T00:00:00.000Z",
      "dimensions": {
        "app_id": "10001",
        "app_name": null,
        "appstore_url": null,
        "category": null,
        "placement_type": "INTE",
        "publisher_id": null,
        "country": null,
        "city": null,
        "carrier": null,
        "device_model": null,
        "connection_type": null,
        "os": null,
        "os_version": null,
        "has_lat_long": null,
        "is_video_enabled": null,
        "has_ifa": null
      },
      "result": {
        "auctions": 8163216,
        "ctr": 0.88311811188811189
      }
    }, {
      "timestamp": "2016-08-22T00:00:00.000Z",
      "dimensions": {
        "app_id": "10002",
        "app_name": null,
        "appstore_url": null,
        "category": null,
        "placement_type": "LIST",
        "publisher_id": null,
        "country": null,
        "city": null,
        "carrier": null,
        "device_model": null,
        "connection_type": null,
        "os": null,
        "os_version": null,
        "has_lat_long": null,
        "is_video_enabled": null,
        "has_ifa": null
      },
      "result": {
        "auctions": 481251251,
        "ctr": 0.12311811188811189
      }
    }, {
      "timestamp": "2016-08-22T00:00:00.000Z",
      "dimensions": {
        "app_id": "10002",
        "app_name": null,
        "appstore_url": null,
        "category": null,
        "placement_type": "CUST",
        "publisher_id": null,
        "country": null,
        "city": null,
        "carrier": null,
        "device_model": null,
        "connection_type": null,
        "os": null,
        "os_version": null,
        "has_lat_long": null,
        "is_video_enabled": null,
        "has_ifa": null
      },
      "result": {
        "auctions": 2200,
        "ctr": 0.0035460992907801418
      }
    }
  ],
  "meta": {
    "currency": "USD"
  }
},

exports.DIMENSIONS_DATA = {

  APP_ID: {
    "query": {
      "filters": {
        "app_id": [],
        "app_name": [],
        "appstore_url": [],
        "category": [],
        "placement_type": [],
        "publisher_id": [],
        "country": [],
        "city": [],
        "carrier": [],
        "device_model": [],
        "connection_type": [],
        "os": [],
        "os_version": [],
        "has_lat_long": [],
        "is_video_enabled": [],
        "has_ifa": []
      },
      "granularity": "all",
      "timestamp": {
        "from": "2016-08-07T00:00:00.000Z",
        "to": "2016-08-07T15:19:00.000Z"
      },
      "dimensions": ["app_id"]
    },
    "data": {
      "app_id": [
        "5049", "6040", "2092", "6395"
      ],
      "app_name": [],
      "appstore_url": [],
      "placement_type": [],
      "category": [],
      "publisher_id": [],
      "country": [],
      "city": [],
      "carrier": [],
      "device_model": [],
      "os": [],
      "os_version": [],
      "connection_type": [],
      "adomain": [],
      "campaign_id": []
    },
    "meta": {
      "currency": "USD"
    }
  }
};
