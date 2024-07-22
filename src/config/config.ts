// src/conf/conf.ts

class Config {
  	// public static readonly BASE_URL = `http://${process.env.REACT_APP_BACKEND_HOST}`;
	// public static readonly API_URL = `${Config.BASE_URL}/api/v1`;
	// public static readonly SOCKET_URL = `${Config.BASE_URL}`;

	//make url relative
	public static readonly SOCKET_URL = '/';
	public static readonly API_URL = '/api/v1';
	public static readonly BASE_URL = '/';
}

export default Config;