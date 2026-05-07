import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Order "mo:core/Order";

actor {
  type ChatMessage = {
    sender : SenderType;
    timestamp : Int;
    message : Text;
  };

  module ChatMessage {
    func compareByTimestamp(msg1 : ChatMessage, msg2 : ChatMessage) : Int {
      msg1.timestamp - msg2.timestamp;
    };

    public func compare(msg1 : ChatMessage, msg2 : ChatMessage) : Order.Order {
      Int.compare(msg1.timestamp, msg2.timestamp);
    };
  };

  type SenderType = {
    #user;
    #bot;
  };

  type ContactInfo = {
    email : Text;
    phone : Text;
    socialLinks : [Text];
  };

  let conversations = Map.empty<Principal, List.List<ChatMessage>>();
  var contactInfo : ?ContactInfo = null;

  public query func getContactInfo() : async ?ContactInfo {
    contactInfo;
  };

  public shared ({ caller }) func updateContactInfo(email : Text, phone : Text, socialLinks : [Text]) : async () {
    contactInfo := ?{
      email;
      phone;
      socialLinks;
    };
  };

  public query ({ caller }) func getConversation() : async [ChatMessage] {
    switch (conversations.get(caller)) {
      case (null) { [] };
      case (?messages) { messages.toArray().sort() };
    };
  };

  public shared ({ caller }) func sendMessage(message : Text) : async Text {
    let timestamp = Time.now();
    let userMessage : ChatMessage = {
      sender = #user;
      timestamp;
      message;
    };

    updateConversation(caller, userMessage);

    let botResponse = getBotResponse(message, timestamp);
    updateConversation(caller, botResponse);

    botResponse.message;
  };

  func updateConversation(user : Principal, message : ChatMessage) {
    let messages = switch (conversations.get(user)) {
      case (null) { List.empty<ChatMessage>() };
      case (?existing) { existing };
    };
    messages.add(message);
    conversations.add(user, messages);
  };

  func arrayJoin(array : [Text], separator : Text) : Text {
    switch (array.size()) {
      case (0) { "" };
      case (1) { array[0] };
      case (_) {
        var result = array[0];
        var i = 1;
        while (i < array.size()) {
          result #= separator # array[i];
          i += 1;
        };
        result;
      };
    };
  };

  func getBotResponse(message : Text, timestamp : Int) : ChatMessage {
    let lower = message.toLower();

    let response = if (lower.contains(#text "hello") or lower.contains(#text "hi")) {
      "Hello! How can I assist you today?";
    } else if (lower.contains(#text "contact")) {
      switch (contactInfo) {
        case (null) { "Contact info not available." };
        case (?info) {
          "Email: " # info.email # ", Phone: " # info.phone # ", Socials: " # arrayJoin(info.socialLinks, ", ");
        };
      };
    } else if (lower.contains(#text "about")) {
      "We're a brand committed to excellence!";
    } else if (lower.contains(#text "services")) {
      "We offer a range of digital services to help your business grow.";
    } else if (lower.contains(#text "bye")) {
      "Goodbye! Have a great day!";
    } else {
      "I'm not sure I understand. Please ask about contact info, our services, or anything else!";
    };

    {
      sender = #bot;
      timestamp;
      message = response;
    };
  };
};
