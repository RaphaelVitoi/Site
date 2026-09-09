import com.google.gson.*;
import java.nio.file.*;
import java.util.*;
import net.holdemresources.internal.kJ;
import net.holdemresources.internal.oH;
import net.holdemresources.internal.oL;
import net.holdemresources.internal.oO;

/** Read-only probe for the installed HRC 4.1.0.202603231401 serialization classes.
 * This does not open the wizard, build an action tree or run a solver.
 */
public class HrcNativeReadProbe {
    private static final Gson GSON = oH.GSON;

    private static JsonObject structure(oL value) {
        JsonObject result = new JsonObject();
        result.addProperty("name", value.getName());
        result.addProperty("chips", value.getChips());
        result.addProperty("paidPlaces", value.getPaidSpots());
        result.addProperty("prizePool", Arrays.stream(value.createStructure()).sum());
        result.addProperty("bountyType", value.getBountyType().toString());
        result.addProperty("progressiveFactor", value.getProgressiveFactor());
        result.add("prizes", GSON.toJsonTree(value.createStructure()));
        return result;
    }

    private static void collect(oO folder, JsonArray target) {
        for (oL value : folder.getStructures()) target.add(structure(value));
        for (oO child : folder.getFolders()) collect(child, target);
    }

    public static void main(String[] args) throws Exception {
        if (args.length != 1) throw new IllegalArgumentException("Expected JSON file path");
        String raw = Files.readString(Path.of(args[0]));
        JsonObject input = JsonParser.parseString(raw).getAsJsonObject();
        JsonObject output = new JsonObject();
        output.addProperty("scope", "native-data-reader-only");
        if (input.has("structures")) {
            oO collection = oL.parseStructures(raw);
            JsonArray values = new JsonArray();
            collect(collection, values);
            output.add("structures", values);
            output.add("nativeReserialized", JsonParser.parseString(oL.saveStructures(collection)));
        } else {
            JsonObject hand = input.getAsJsonObject("handdata");
            kJ nativeHand = GSON.fromJson(hand, kJ.class);
            JsonObject roundtrip = GSON.toJsonTree(nativeHand).getAsJsonObject();
            for (String key : List.of("stacks", "blinds", "anteType", "skipSb", "movingBu", "straddleType")) {
                if (hand.has(key) && !hand.get(key).equals(roundtrip.get(key))) {
                    throw new IllegalArgumentException("Native hand roundtrip changed field: " + key);
                }
            }
            output.add("handdata", roundtrip);
            oL nativeStructure = GSON.fromJson(input.getAsJsonObject("eqmodel").get("structure"), oL.class);
            output.add("structure", structure(nativeStructure));
            // Context only: this does not instantiate the native MTT equity model.
            double[] others = GSON.fromJson(input.getAsJsonObject("eqmodel").get("otherstacks"), double[].class);
            output.add("otherstacks", GSON.toJsonTree(others));
        }
        System.out.println(GSON.toJson(output));
    }
}
