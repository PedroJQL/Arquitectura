#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

#define DHTPIN 2     // Pin donde está conectado el sensor DHT11
#define DHTTYPE DHT11   // Tipo de sensor DHT (DHT11 o DHT22)

DHT dht(DHTPIN, DHTTYPE);

const char* ssid = "GONZALEZ-B";
const char* password =  "SZ2713PDK221725";
const char* serverName = "http://127.0.0.1:3000/estudiante";

String nombreCompleto = "Kristian Josue Gonzalez Barrientos";
String correoUniversidad = "kgonzalezb9@miumg.edu.gt";
String numeroCarnet = "0902-21-5567";
float latitud = 15.47927; // Agrega la lectura de la latitud
float longitud = -90.31310; // Agrega la lectura de la longitud
float humedad = 80; // Agrega la lectura de la humedad
float temperatura = 26; // Agrega la lectura de la temperatura

unsigned long lastTime = 0;
unsigned long timerDelay = 5000;

void setup() {
  Serial.begin(115200);
  // Configurar la conexión WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
dht.begin();
}

void loop() {
  if ((millis() - lastTime) > timerDelay) {
   humedad = dht.readHumidity();
    temperatura = dht.readTemperature();
    
    if (isnan(humedad) || isnan(temperatura)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }
    if(WiFi.status() == WL_CONNECTED) {
      WiFiClient client;
      HTTPClient http;
      
      http.begin(client, serverName);
      http.addHeader("Content-Type", "application/json");
      
      // Construir el cuerpo de la solicitud POST con los datos
      String postData = "{\"nombre\":\"" + nombreCompleto + "\",";
      postData += "\"correo\":\"" + correoUniversidad + "\",";
      postData += "\"carne\":\"" + numeroCarnet + "\",";
      postData += "\"latitud\":" + String(latitud) + ",";
      postData += "\"longitud\":" + String(longitud) + ",";
      postData += "\"humedad\":" + String(humedad) + ",";
      postData += "\"temperatura\":" + String(temperatura) + ",";
      postData += "\"device\":\"ESP32-KRISTIAN\",";
      postData += "\"ip\":\"172.0.0.1\",";
      postData += "\"pais\":\"GT\"}";
      
      int httpResponseCode = http.POST(postData);
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      http.end();
    } else {
      Serial.println("WiFi Disconnected");
    }
    lastTime = millis();
  }
}
